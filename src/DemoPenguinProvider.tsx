"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/*
---
npm run build
yalc publish --push
---
*/

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

import { X } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import { progressBarItems } from "./progress-bar-options";

export interface Penguin {
  id: string;
  applicationId: string;
  path: string; //the url path for when the dialog is opened
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive";
  steps: Step[]; //array of steps, could be one
  stepsCount: number;
  themeId: string;
  progressBar: string | null;
  flowType: "onboarding" | "promotion" | "userGroups" | "feedback";
}

export interface Step {
  id: string
  title: string
  backButton: boolean
  skipButton: boolean
  nextButtonText: string
  description: string
  imageUrl?: string
  thumbnailUrl?: string
  videoUrl?: string
  selectorId?: string
  width?: number
  height?: number
  onClickWithinArea?: () => void
  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "left-center" | "right-center" | "center"
  backdrop: boolean
  size: "small" | "medium" | "large";
  dataInputs: DataInput[];
}

export interface DataInput {
  id: string;
  name: string;
  type: string;
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
  backgroundColorHex: string;
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
  backgroundColorHex: "#ffffff",
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
  userId?: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  additionalInfo?: any;
  devMode?: boolean;
}

interface PathChangeConfig {
  onPathChange?: (newPath: string, oldPath: string) => void;
  shouldTrigger?: (newPath: string, oldPath: string) => boolean;
}

function usePathMonitor({ onPathChange, shouldTrigger }: PathChangeConfig = {}) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const handlePathChange = useCallback((newPath: string) => {
    if (newPath !== currentPath) {
      if (!shouldTrigger || shouldTrigger(newPath, currentPath)) {
        onPathChange?.(newPath, currentPath);
        setCurrentPath(newPath);
      }
    }
  }, [currentPath, onPathChange, shouldTrigger]);

  useEffect(() => {
    // Check for initial path change
    handlePathChange(window.location.pathname);

    // Setup listeners for different types of navigation
    const checkPath = () => handlePathChange(window.location.pathname);

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', checkPath);

    // Create observer for URL changes
    const observer = new MutationObserver(() => {
      handlePathChange(window.location.pathname);
    });

    // Observe changes to the URL
    observer.observe(document.querySelector('body')!, {
      subtree: true,
      childList: true
    });

    return () => {
      window.removeEventListener('popstate', checkPath);
      observer.disconnect();
    };
  }, [handlePathChange]);

  return currentPath;
}

const DemoPenguinContext = createContext<DemoPenguinContextType | null>(null);

const PADDING = 16;

const getStepDimensions = (step: Step) => {
  const baseHeights = {
    "small": 250,
    "medium": 350,
    "large": 400
  };

  const mediaHeights = {
    "small": 350,
    "medium": 450,
    "large": 500
  };

  const sizes = {
    "small": { width: 300 },
    "medium": { width: 400 },
    "large": { width: 500 }
  };

  const hasMedia = step.imageUrl || step.videoUrl;
  const height = hasMedia ? mediaHeights[step.size] : baseHeights[step.size];

  return {
    width: sizes[step.size].width,
    height: height
  };
};

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
  step: Step
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { width: contentWidth, height: contentHeight } = getStepDimensions(step);
  const MINIMUM_SPACE = PADDING * 2; // Minimum space needed for content

  // Calculate available space in each direction
  const spaceAbove = elementPos.top;
  const spaceBelow = viewportHeight - (elementPos.top + elementPos.height);
  const spaceLeft = elementPos.left;
  const spaceRight = viewportWidth - (elementPos.left + elementPos.width);

  // Calculate positions for each direction
  const positions = {
    top: {
      top: elementPos.top - contentHeight - PADDING,
      left: elementPos.left + elementPos.width / 2 - contentWidth / 2,
      space: spaceAbove,
      fits: spaceAbove >= contentHeight + MINIMUM_SPACE
    },
    bottom: {
      top: elementPos.top + elementPos.height + PADDING,
      left: elementPos.left + elementPos.width / 2 - contentWidth / 2,
      space: spaceBelow,
      fits: spaceBelow >= contentHeight + MINIMUM_SPACE
    },
    left: {
      top: elementPos.top + elementPos.height / 2 - contentHeight / 2,
      left: elementPos.left - contentWidth - PADDING,
      space: spaceLeft,
      fits: spaceLeft >= contentWidth + MINIMUM_SPACE
    },
    right: {
      top: elementPos.top + elementPos.height / 2 - contentHeight / 2,
      left: elementPos.left + elementPos.width + PADDING,
      space: spaceRight,
      fits: spaceRight >= contentWidth + MINIMUM_SPACE
    }
  };

  // Find the best position by checking which has the most available space
  const bestPosition = Object.entries(positions)
    .filter(([_, pos]) => pos.fits)
    .sort((a, b) => b[1].space - a[1].space)[0]?.[0] || 'bottom';

  const bestPos = positions[bestPosition as keyof typeof positions];
  const { top, left } = bestPos;

  // Ensure content stays within viewport bounds
  return {
    top: Math.max(PADDING, Math.min(top, viewportHeight - contentHeight - PADDING)),
    left: Math.max(PADDING, Math.min(left, viewportWidth - contentWidth - PADDING)),
    width: contentWidth,
    height: contentHeight,
    position: bestPosition // Return the chosen position for reference
  };
}

function calculateStaticPosition(step: Step) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { width, height } = getStepDimensions(step);
  if (step.position) {
    switch (step.position) {
      case "top-left":
        return {
          top: PADDING,
          left: PADDING
        }
      case "top-center":
        return {
          top: PADDING,
          left: (viewportWidth - width) / 2
        }
      case "top-right":
        return {
          top: PADDING,
          left: viewportWidth - width
        }
      case "bottom-left":
        return {
          top: viewportHeight - height - PADDING,
          left: PADDING
        }
      case "bottom-center":
        return {
          top: viewportHeight - height - PADDING,
          left: (viewportWidth - width) / 2
        }
      case "bottom-right":
        return {
          top: viewportHeight - height - PADDING, 
          left: viewportWidth - width - PADDING
        }
      case "left-center":
        return {
          top: (viewportHeight - height) / 2,
          left: PADDING
        }
      case "right-center":
        return {
          top: (viewportHeight - height) / 2,
          left: viewportWidth - width
        }
      case "center":
        return {
          top: (viewportHeight - height) / 2,
          left: (viewportWidth - width) / 2
        }
    } 
  }
  else {
    return {
      top: (viewportHeight - height) / 2,
      left: (viewportWidth - width) / 2
    };
  }
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
  userEmail,
  firstName,
  lastName,
  additionalInfo,
  devMode,
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
  const [developmentDomain, setDevelopmentDomain] = useState(false);
  const [progressBar, setProgressBar] = useState<string | null>(null);
  const updateElementPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      if (steps[currentStep]?.selectorId) {
        const position = getElementPosition(steps[currentStep]?.selectorId ?? "");
        if (position) {
          setElementPosition(position);
        }
      } else {
        setElementPosition(null);
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

  const fetchDemoPenguinData = (pathname: string) => {
    fetch(devMode ? DEMO_PENGUIN_API_URL_DEV : DEMO_PENGUIN_API_URL, {
      method: 'GET',
      headers: new Headers({
        'demopenguin-client-token': clientToken,
        'demopenguin-pathname': pathname,
        'demopenguin-user-id': userId || '',
        'demopenguin-user-email': userEmail || '',
        'demopenguin-first-name': firstName || '',
        'demopenguin-last-name': lastName || '',
        'demopenguin-additional-info': JSON.stringify(additionalInfo || {})
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Data:", data);
        if (data.status === "not found") {
          console.log("DemoPenguin is not found");
          return;
        } else if (data.status === "error") {
          console.log(data.error);
          return;
        } else if (data.status === "inactive" && (!data.developmentDomain)) {
          console.log("DemoPenguin is inactive");
          return;
        }
        else if (data.status === "seen" && !data.developmentDomain) {
          console.log("DemoPenguin is seen");
          return;
        }
        else {
          setDevelopmentDomain(data.developmentDomain);
          setSteps(data.steps);
          setTheme(data.theme)
          setProgressBar(data.progressBar)
          console.log("DemoPenguin is active");
          setIsOpen(true);
        }
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    const currentUrl = window.location.pathname;
    fetchDemoPenguinData(currentUrl);
  }, [clientToken, devMode]);

  const currentPath = usePathMonitor({
    onPathChange: (newPath, oldPath) => {
      console.log(`Path changed from ${oldPath} to ${newPath}`);
      // Add your path change logic here
      // For example, refetch demo penguin data
      fetchDemoPenguinData(newPath); // You'll need to extract your fetch logic into a function
    },
    shouldTrigger: (newPath, oldPath) => {
      // Optional: Add conditions for when path changes should trigger actions
      // For example, ignore hash changes or specific paths
      return true;
    }
  });

  const renderStepContent = (highlightStep: boolean, step: Step, progressBar: string | null, theme: Theme, previousStep: () => void, nextStep: () => void, currentStep: number) => {

    const sizesToClass = {
      "small": 'w-[300px]',
      "medium": 'w-[400px]',
      "large": 'w-[500px]'
    }
    const cardClass = `
        ${theme.backgroundColor} 
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
        shadow-lg`

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

    const buttonClass = `
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

    const skipButtonClass = `
    ${theme.buttonBorderRadius}
    ${theme.buttonBorderWidth}
    ${theme.buttonBorderStyle}
    ${theme.buttonSize}
    ${theme.buttonTextWeight}
    ${theme.skipButtonTextColor} 
    ${theme.skipButtonBackgroundColor} 
    ${theme.skipButtonHoverTextColor} 
    ${theme.skipButtonHoverBackgroundColor}`

    const buttonText = currentStep === steps.length - 1 ? "Done" : step.nextButtonText
    if (highlightStep) {
      return (
        <div className={cardClass}>
          {
            step.skipButton && (
              <X className="h-5 w-5 absolute top-2 right-2 text-muted-foreground hover:text-primary cursor-pointer" />
            )
          }
          {
            step.imageUrl && (
              <img
                src={step.imageUrl}
                className="rounded-lg w-full h-full object-cover" />
            )
          }
          {step.videoUrl ? (
            <VideoPlayer
              key={step.videoUrl}
              src={step.videoUrl}
              thumbnailSrc={step.thumbnailUrl}
            />
          ) : null
          }
          <motion.div
            key={`tour-content-${step.id}`}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            className="overflow-hidden mt-2"
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
          <div className={`w-full flex flex-row gap-2 ${progressBar ? 'justify-between' : 'justify-end'} items-center mt-2`}>
            {
              progressBar && (
                //use progressBarItems to find and render only the selected progress bar
                progressBarItems
                  .filter(item => item.value === progressBar)
                  .map((item) => (
                    <item.component
                      key={item.value}
                      currentStepIndex={currentStep}
                      totalSteps={steps.length}
                    />
                  ))
              )
            }
            <div className="flex justify-end gap-2">

              {step.backButton && (
                <Button
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className={skipButtonClass}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={nextStep}
                className={buttonClass}
              >
                {buttonText}
              </Button>
            </div>
          </div>
          {developmentDomain && (
            <div className="text-muted-foreground bg-orange-500 text-white text-xs absolute -bottom-8 right-2 rounded-b-md p-2">
              Development Domain
            </div>
          )}
        </div>
      )
    }

    else {
      return (
        <AlertDialogContent className={cardClass}>
          <>
            {
              step.skipButton && (
                <X className="h-5 w-5 absolute top-2 right-2 text-muted-foreground hover:text-primary cursor-pointer" />
              )
            }
            {
              step.imageUrl && (
                <img
                  src={step.imageUrl}
                  className="rounded-lg w-full h-full object-cover" />
              )
            }
            {step.videoUrl ? (
              <VideoPlayer
                key={step.videoUrl}
                src={step.videoUrl}
                thumbnailSrc={step.thumbnailUrl}
              />
            ) : null
            }
            <motion.div
              key={`tour-content-${step.id}`}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              className="overflow-hidden mt-2"
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

            <div className={`w-full flex flex-row gap-2 ${progressBar ? 'justify-between' : 'justify-end'} items-center mt-2`}>
              {
                progressBar && (
                  //use progressBarItems to find and render only the selected progress bar
                  progressBarItems
                    .filter(item => item.value === progressBar)
                    .map((item) => (
                      <item.component
                        key={item.value}
                        currentStepIndex={currentStep}
                        totalSteps={steps.length}
                      />
                    ))
                )
              }
              <div className="flex justify-end gap-2">

                {step.backButton && (
                  <Button
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className={skipButtonClass}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={nextStep}
                  className={buttonClass}
                >
                  {buttonText}
                </Button>
              </div>
            </div>
            {developmentDomain && (
              <div className="text-muted-foreground bg-orange-500 text-white text-xs absolute -bottom-8 right-2 rounded-b-md p-2">
                Development Domain active
              </div>
            )}
          </>
        </AlertDialogContent >
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 z-50 overflow-hidden ${steps[currentStep]?.backdrop ? 'bg-black/50' : ''}`}
                style={{
                  ...(elementPosition && {
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
                        )`
                  })
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: elementPosition?.top,
                  left: elementPosition?.left,
                  width: steps[currentStep]?.width || elementPosition?.width,
                  height: steps[currentStep]?.height || elementPosition?.height,
                }}
                className={cn("z-[100] border-2 border-muted-foreground", className)}
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  top: elementPosition
                    ? calculateContentPosition(elementPosition, steps[currentStep]).top
                    : `${calculateStaticPosition(steps[currentStep]).top}px`,
                  left: elementPosition
                    ? calculateContentPosition(elementPosition, steps[currentStep]).left
                    : `${calculateStaticPosition(steps[currentStep]).left}px`,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 0.4 },
                }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute",
                  transform: elementPosition ? 'none' : 'none'
                }}
                className="bg-transparent relative z-[100] w-fit p-0"
              >
                <AnimatePresence mode="wait">
                  {renderStepContent(true, steps[currentStep], progressBar, theme || defaultTheme, previousStep, nextStep, currentStep)}
                </AnimatePresence>
              </motion.div>
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


