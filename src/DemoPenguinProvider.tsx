"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { cn } from "./utils";

import { ArrowRight, Torus, X } from "lucide-react";

export interface Step {
  id: string
  title: string
  backButton: boolean
  skipButton: boolean
  nextButtonText: string
  description: string
  imageUrl?: string
  selectorId?: string
  width?: number
  height?: number
  onClickWithinArea?: () => void
  position?: "top" | "bottom" | "left" | "right"
  size: "small" | "medium" | "large";

}

export interface Theme {
  id: string;
  name: string;
  titleTextColor: string;
  titleTextSize: string;
  titleTextWeight: string;
  titleTextAlign: string;
  titleTextPaddingX: string;
  titleTextPaddingY: string;

  descriptionTextColor: string;
  descriptionTextSize: string;
  descriptionTextWeight: string;
  descriptionTextAlign: string;
  descriptionTextPaddingX: string;
  descriptionTextPaddingY: string;

  backgroundColor: string;
  shadowColor: string;
  shadowOpacity: string;
  shadowRadius: string;
  shadowOffsetX: string;
  shadowOffsetY: string;

  cardRadius: string;
  cardBorderColor: string;
  cardBorderWidth: string;
  cardBorderStyle: string;
  cardPaddingX: string;
  cardPaddingY: string;

  skipButtonTextColor: string;
  skipButtonBackgroundColor: string;
  skipButtonHoverTextColor: string;
  skipButtonHoverBackgroundColor: string;

  buttonSize: string;
  buttonTextColor: string;
  buttonHoverTextColor: string;
  buttonTextSize: string;
  buttonBackgroundColor: string;
  buttonHoverBackgroundColor: string;
  buttonBorderColor: string;
  buttonBorderRadius: string;
  buttonBorderWidth: string;
  buttonBorderStyle: string;
  buttonTextWeight: string;
}

const defaultTheme: Theme = {
  id: 'default-light',
  name: "Default Light",
  titleTextColor: "text-gray-800",
  titleTextSize: "text-lg",
  titleTextWeight: "font-medium",
  titleTextAlign: "text-left",
  titleTextPaddingX: "px-0",
  titleTextPaddingY: "py-0",
  descriptionTextColor: "text-gray-600",
  descriptionTextSize: "text-sm",
  descriptionTextWeight: "font-medium",
  descriptionTextAlign: "text-left",
  descriptionTextPaddingX: "px-0",
  descriptionTextPaddingY: "py-0",
  backgroundColor: "bg-white",
  shadowColor: "shadow-gray-200",
  shadowOpacity: "shadow-opacity-20",
  shadowRadius: "shadow-radius-0",
  shadowOffsetX: "shadow-offset-x-0",
  shadowOffsetY: "shadow-offset-y-0",
  cardRadius: "rounded-sm",
  cardBorderColor: "border-black",
  cardBorderWidth: "border-0",
  cardBorderStyle: "solid",
  cardPaddingX: "px-2",
  cardPaddingY: "py-2",
  skipButtonTextColor: "text-white",
  skipButtonBackgroundColor: "bg-gray-400",
  skipButtonHoverTextColor: "hover:text-white",
  skipButtonHoverBackgroundColor: "hover:bg-gray-600",
  buttonSize: "h-8",
  buttonTextColor: "text-white",
  buttonTextSize: "text-sm",
  buttonBackgroundColor: "bg-gray-800",
  buttonHoverTextColor: "hover:text-white",
  buttonHoverBackgroundColor: "hover:bg-gray-600",
  buttonBorderColor: "border-black",
  buttonBorderRadius: "rounded-sm",
  buttonBorderWidth: "border-0",
  buttonBorderStyle: "solid",
  buttonTextWeight: "font-normal",
}

interface DemoPenguinContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: Step[]) => void;
  steps: Step[];
  theme: Theme;
  isTourCompleted: boolean;
  setIsTourCompleted: (completed: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface DemoPenguinProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  isTourCompleted?: boolean;
  clientToken: string;
  userId: string;
  userInfo: any;
  devMode?: boolean;
}

const DemoPenguinContext = createContext<DemoPenguinContextType | null>(null);

const PADDING = 16;
const CONTENT_WIDTH = 300;
const CONTENT_HEIGHT = 200;

function getElementPosition(id: string) {
  const element = document.getElementById(id);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

function calculateContentPosition(
  elementPos: { top: number; left: number; width: number; height: number },
  position: "top" | "bottom" | "left" | "right" = "bottom"
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position) {
    case "top":
      top = elementPos.top - CONTENT_HEIGHT - PADDING;
      left = elementPos.left + elementPos.width / 2 - CONTENT_WIDTH / 2;
      break;
    case "bottom":
      top = elementPos.top + elementPos.height + PADDING;
      left = elementPos.left + elementPos.width / 2 - CONTENT_WIDTH / 2;
      break;
    case "left":
      left = elementPos.left - CONTENT_WIDTH - PADDING;
      top = elementPos.top + elementPos.height / 2 - CONTENT_HEIGHT / 2;
      break;
    case "right":
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - CONTENT_HEIGHT / 2;
      break;
  }

  return {
    top: Math.max(PADDING, Math.min(top, viewportHeight - CONTENT_HEIGHT - PADDING)),
    left: Math.max(PADDING, Math.min(left, viewportWidth - CONTENT_WIDTH - PADDING)),
    width: CONTENT_WIDTH,
    height: CONTENT_HEIGHT
  };
}

const DEMO_PENGUIN_API_URL = "https://www.demopenguin.com/api/v1/get/penguin";
const DEMO_PENGUIN_API_URL_DEV = "http://localhost:3000/api/v1/get/penguin";

export function DemoPenguinProvider({
  children,
  onComplete,
  className,
  isTourCompleted = false,
  clientToken,
  userId,
  userInfo,
  devMode = false,
}: DemoPenguinProviderProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null)


  const updateElementPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const position = getElementPosition(steps[currentStep]?.selectorId ?? "");
      if (position) {
        setElementPosition(position);
      }
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateElementPosition();
    window.addEventListener("resize", updateElementPosition);
    window.addEventListener("scroll", updateElementPosition);

    return () => {
      window.removeEventListener("resize", updateElementPosition);
      window.removeEventListener("scroll", updateElementPosition);
    };
  }, [updateElementPosition]);


  const nextStep = useCallback(async () => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        return -1;
      }
      return prev + 1;
    });

    if (currentStep === steps.length - 1) {
      setIsTourCompleted(true);
      onComplete?.();
    }
  }, [steps.length, onComplete, currentStep]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  const startTour = useCallback(() => {
    if (isTourCompleted) {
      return;
    }
    setCurrentStep(0);
    setIsOpen(false);
  }, [isTourCompleted]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (currentStep >= 0 && elementPosition && steps[currentStep]?.onClickWithinArea) {
        const clickX = e.clientX + window.scrollX;
        const clickY = e.clientY + window.scrollY;

        const isWithinBounds =
          clickX >= elementPosition.left &&
          clickX <= elementPosition.left + (steps[currentStep]?.width || elementPosition.width) &&
          clickY >= elementPosition.top &&
          clickY <= elementPosition.top + (steps[currentStep]?.height || elementPosition.height);

        if (isWithinBounds) {
          steps[currentStep].onClickWithinArea?.();
        }
      }
    },
    [currentStep, elementPosition, steps]
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  const setIsTourCompleted = useCallback((completed: boolean) => {
    setIsCompleted(completed);
  }, []);

  useEffect(() => {
    const currentUrl = window.location.pathname;
    console.log("DemoPenguin initialized with:", { clientToken });
    console.log("Current URL:", currentUrl);

    fetch(devMode ? DEMO_PENGUIN_API_URL_DEV : DEMO_PENGUIN_API_URL, {
      headers: {
        'demopenguin-client-token': clientToken,
        'demopenguin-pathname': currentUrl
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log("Data:", data);
        if (data.status === "not found") {
          console.log("DemoPenguin is not found");
          return;
        } else if (data.status === "inactive") {
          console.log("DemoPenguin is inactive");
          return;
        } else {
          setSteps(data.steps);
          setTheme(data.theme)
          console.log("DemoPenguin is active");
          setIsOpen(true);
        }
      })
      .catch(error => console.error('Error:', error));
  }, [clientToken, devMode]);

  const renderStepContent = (highlightStep: boolean, step: Step, theme: Theme, previousStep: () => void, nextStep: () => void) => {
    console.log("Step:", step);
    console.log("Theme:", theme);
    const sizesToClass = {
      "small": 'w-[240px]',
      "medium": 'w-[350px]',
      "large": 'w-[500px]'
    }
    const cardClass = `${theme.backgroundColor} 
        ${theme.shadowColor}
        ${theme.shadowOpacity}
        ${theme.shadowRadius}
        ${theme.shadowOffsetX}
        ${theme.shadowOffsetY}
        ${theme.cardRadius}
        ${theme.cardBorderColor}
        ${theme.cardBorderWidth}
        ${theme.cardBorderStyle}
        ${theme.cardPaddingX}
        ${theme.cardPaddingY}
        ${sizesToClass[step.size]}
        p-4 shadow-lg`

    const titleTextClass = `${theme.titleTextColor}
        ${theme.titleTextSize}
        ${theme.titleTextWeight}
        ${theme.titleTextAlign}
        ${theme.titleTextPaddingX}
        ${theme.titleTextPaddingY}`

    const descriptionTextClass = `${theme.descriptionTextColor}
        ${theme.descriptionTextSize}
        ${theme.descriptionTextWeight}
        ${theme.descriptionTextAlign}
        ${theme.descriptionTextPaddingX}
        ${theme.descriptionTextPaddingY}`

    const buttonClass = `mt-4
        ${theme.buttonSize}
        ${theme.buttonTextColor}
        ${theme.buttonTextSize}
        ${theme.buttonBackgroundColor}
        ${theme.buttonBorderColor}
        ${theme.buttonBorderRadius}
        ${theme.buttonBorderWidth}
        ${theme.buttonBorderStyle}
        ${theme.buttonTextWeight}
        ${theme.buttonHoverTextColor}
        ${theme.buttonHoverBackgroundColor}`

    const skipButtonClass = `${theme.skipButtonTextColor} ${theme.skipButtonBackgroundColor} ${theme.skipButtonHoverTextColor} ${theme.skipButtonHoverBackgroundColor}`

    if (highlightStep) {
      return (
        <div className={cardClass}>
          {
            step.imageUrl && (
              <img
                style={{
                  marginBottom: "16px",
                }}
                src={step.imageUrl}
                className="rounded-lg w-full h-full object-cover" />
            )
          }
          <motion.div
            key={`tour-content-${step.id}`}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            className="overflow-hidden"
            transition={{
              duration: 0.2,
              height: {
                duration: 0.4,
              },
            }}
          >
            <h2 className={titleTextClass}>{step.title}</h2>
            <p className={descriptionTextClass}>{step.description}</p>
          </motion.div>
          <div className="mt-4 flex w-full justify-between">
            {step.backButton && (
              <Button
                onClick={previousStep}
                disabled={currentStep === 0}
                className={buttonClass}
              >
                Back
              </Button>
            )}
            <div className="text-muted-foreground text-xs">
              {currentStep + 1} / {steps.length}
            </div>
            <Button
              onClick={nextStep}
              className={buttonClass}
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      )
    }

    else {
      return (
        <AlertDialogContent className={cardClass}>
          {
            step.skipButton && (
              <X className="h-5 w-5 absolute top-2 right-2 text-muted-foreground hover:text-primary cursor-pointer" />
            )
          }
          <div className={`flex gap-2 ${step.imageUrl && 'flex-col'}`}>
            {
              step.imageUrl ? (
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  width={1600}
                  height={1600}
                  className="w-full h-auto rounded-sm object-cover"
                />
              ) : null
            }
            <div className="flex-1">
              <AlertDialogTitle className={`
                    ${titleTextClass}
                    tracking-tight line-clamp-2`}>{step.title}</AlertDialogTitle>
              <AlertDialogDescription className={`
                    ${descriptionTextClass}
                    tracking-tight line-clamp-2`}>{step.description}</AlertDialogDescription>
              <div className="flex justify-end gap-2">
                {
                  step.backButton && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        previousStep()
                      }}
                      className={`${buttonClass} ${skipButtonClass}`}>Back</Button>
                  )
                }
                <Button
                  onClick={() => {
                    nextStep()
                  }}
                  type="button"
                  className={`group ${buttonClass}`}>{step.nextButtonText}
                  <ArrowRight
                    className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      )
    }
  }

  return (
    <DemoPenguinContext.Provider
      value={{
        currentStep,
        totalSteps: steps.length,
        nextStep,
        previousStep,
        endTour,
        isActive: currentStep >= 0,
        startTour,
        setSteps,
        steps,
        theme: theme || defaultTheme,
        isTourCompleted: isCompleted,
        setIsTourCompleted,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
      {isOpen && (
        <AnimatePresence>
          {currentStep >= 0 && (
            <>
              {steps[currentStep]?.selectorId && elementPosition ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 overflow-hidden bg-black/50"
                    style={{
                      clipPath: `polygon(
                      0% 0%,                                                                          /* top-left */
                      0% 100%,                                                                        /* bottom-left */
                      100% 100%,                                                                      /* bottom-right */
                      100% 0%,                                                                        /* top-right */
                      
                      /* Create rectangular hole */
                      ${elementPosition.left}px 0%,                                                   /* top edge start */
                      ${elementPosition.left}px ${elementPosition.top}px,                             /* hole top-left */
                      ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top}px,  /* hole top-right */
                      ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,  /* hole bottom-right */
                      ${elementPosition.left}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,  /* hole bottom-left */
                      ${elementPosition.left}px 0%                                                    /* back to top edge */
                    )`,
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: elementPosition.top,
                      left: elementPosition.left,
                      width: steps[currentStep]?.width || elementPosition.width,
                      height: steps[currentStep]?.height || elementPosition.height,
                    }}
                    className={cn("z-[100] border-2 border-muted-foreground", className)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10, top: 50, right: 50 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      top: calculateContentPosition(elementPosition, steps[currentStep]?.position).top,
                      left: calculateContentPosition(elementPosition, steps[currentStep]?.position).left,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      opacity: { duration: 0.4 },
                    }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: "absolute",
                      width: calculateContentPosition(elementPosition, steps[currentStep]?.position)
                        .width,
                    }}
                    className="bg-transparent relative z-[100] w-fit p-0 shadow-lg"
                  >
                    <AnimatePresence mode="wait">
                      {renderStepContent(true, steps[currentStep], theme || defaultTheme, previousStep, nextStep)}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : (
                <AlertDialog open={true}>
                  {renderStepContent(false, steps[currentStep], theme || defaultTheme, previousStep, nextStep)}
                </AlertDialog>
              )}
            </>
          )}
        </AnimatePresence>
      )}
    </DemoPenguinContext.Provider>
  );
}

export function useDemoPenguin() {
  const context = useContext(DemoPenguinContext);
  if (!context) {
    throw new Error("useDemoPenguin must be used within a DemoPenguinProvider");
  }
  return context;
}


