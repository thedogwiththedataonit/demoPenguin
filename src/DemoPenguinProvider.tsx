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

import { ArrowRight, Torus } from "lucide-react";

export interface DemoPenguinStep {
  title: string;
  description: string;
  selectorId?: string;
  width?: number;
  height?: number;
  onClickWithinArea?: () => void;
  position?: "top" | "bottom" | "left" | "right";
}

interface DemoPenguinContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: DemoPenguinStep[]) => void;
  steps: DemoPenguinStep[];
  isTourCompleted: boolean;
  setIsTourCompleted: (completed: boolean) => void;
}

interface DemoPenguinProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  isTourCompleted?: boolean;
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

export function DemoPenguinProvider({
  children,
  onComplete,
  className,
  isTourCompleted = false,
}: DemoPenguinProviderProps) {
  const [steps, setSteps] = useState<DemoPenguinStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);

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
        isTourCompleted: isCompleted,
        setIsTourCompleted,
      }}
    >
      {children}
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
                  className="bg-background relative z-[100] rounded-lg border p-4 shadow-lg"
                >
                  <div className="text-muted-foreground absolute right-4 top-4 text-xs">
                    {currentStep + 1} / {steps.length}
                  </div>
                  <AnimatePresence mode="wait">
                    <div>
                      <motion.div
                        key={`tour-content-${currentStep}`}
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
                        <h2 className="text-lg font-medium">{steps[currentStep]?.title}</h2>
                        <p className="text-muted-foreground">{steps[currentStep]?.description}</p>
                      </motion.div>
                      <div className="mt-4 flex justify-between">
                        {currentStep > 0 && (
                          <button
                            onClick={previousStep}
                            disabled={currentStep === 0}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Previous
                          </button>
                        )}
                        <button
                          onClick={nextStep}
                          className="ml-auto text-sm font-medium text-primary hover:text-primary/90"
                        >
                          {currentStep === steps.length - 1 ? "Finish" : "Next"}
                        </button>
                      </div>
                    </div>
                  </AnimatePresence>
                </motion.div>
              </>
            ) : (
              <AlertDialog open={true}>
                <AlertDialogContent className="max-w-md p-6">
                  <AlertDialogHeader className="flex flex-col items-center justify-center">
                    <AlertDialogTitle className="text-center text-xl font-medium">
                      {steps[currentStep]?.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
                      {steps[currentStep]?.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex justify-center space-x-1.5 max-sm:order-1">
                      {[...Array(steps.length)].map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-2 w-3 rounded-full bg-primary",
                            index === currentStep ? "bg-primary" : "opacity-20",
                          )}
                        />
                      ))}
                    </div>
                    <Button className="group" type="button" onClick={nextStep}>
                      {currentStep === steps.length - 1 ? "Finish" : "Continue"}
                      <ArrowRight
                        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </AnimatePresence>
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

export function DemoPenguinAlertDialog({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const { startTour, steps, isTourCompleted, currentStep } = useDemoPenguin();

  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    return null;
  }
  const handleSkip = async () => {
    setIsOpen(false);
  };


  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <motion.div
              initial={{ scale: 0.7, filter: "blur(10px)" }}
              animate={{
                scale: 1,
                filter: "blur(0px)",
                y: [0, -8, 0],
                rotate: [42, 48, 42],
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                y: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Torus className="size-32 stroke-1 text-primary" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center text-xl font-medium">
            Welcome to the Tour
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            Take a quick tour to learn about the key features and functionality of this application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 space-y-3">
          <Button onClick={startTour} className="w-full">
            Start Guide
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Skip Guide
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}