"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/*
---
npm run build
yalc publish --push
---
*/

import { cn } from "./utils";

import { ExternalLink, Route, X } from "lucide-react";
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


export type Step = {
  id: string
  rows: StepRow[]

  onHover: string
  animation: string //different default animation styles (fade in, maybe each row with a delay)
  fullscreen: boolean // whether or not to have the step encompass the fullscreen, this means there is no card, or the card is transparent
  px: string //tailwind px-2
  py: string //tailwind py-2

  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "left-center" | "right-center" | "center"
  selectorId?: string
  backdrop: boolean

  width: string,
  height: string,


  //card styles
  cardShadowSize: string
  cardBackgroundColor: string  // can also be gradient
  cardBorderWidth: string;
  cardBorderStyle: string;
  cardRadius: string;
  cardBorderColor: string;

}

export type StepRow = { //steps will have auto height 
  paddingTop: string
  paddingBottom: string
  paddingLeft: string
  paddingRight: string
  borderColor: string
  borderWidth: string
  borderStyle: string
  border: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset"
  borderSide: "top" | "bottom" | "left" | "right" | "top-bottom" | "left-right" | "default"
  rowItems: (StepText | StepImage | StepButton | StepProgressBar | StepInput | StepVideo)[]
  rowGap: string
}

export type StepImage = {
  stepType: "image"
  imageUrl?: string
  thumbnailUrl?: string
  videoUrl?: string
  videoId?: string
  px: string //tailwind px-2
  py: string //tailwind py-2

  height?: string
  width?: string
  //size: "small" | "medium" | "large" | "custom" maybe we don't need this if we define the w and h
  objectFit?: "object-cover" | "object-fill" | "object-contain" //if the height or width is defined, we need to set the object fit

  imageBackgroundColor: string
  imageBorderColor: string;
  imageBorderWidth: string;
  imageRadius: string
}

export type StepVideo = {
  stepType: "video"
  width: string  //auto will be sized based on the children rows
  height: string  //auto will be sized based on the children rows
  //size: "small" | "medium" | "large" | "custom" maybe we don't need this if we define the w and h
  px: string //tailwind px-2
  py: string //tailwind py-2
}


export type StepText = {
  stepType: "text"
  text: string //the actual text
  link: string | null //if the text is a link, it will be a url, if its a link it will have an underline

  px: string //tailwind px-2
  py: string //tailwind py-2
  textWeight: string
  textSize: string
  textColor: string //not tailwind, justa hex string
  textSpacing: string //tracking-tx
  textAlign: string

}



export type StepButton = {
  stepType: "button"
  buttonType: "next" | "previous" | "skip" | "back" | "submit" | "navigate"
  navigation: {
    text: string
    url: string
    type: "internal" | "external";
  }
  text: string //the actual text

  px: string //tailwind px-2
  py: string //tailwind py-2

  onHover: string;
  buttonTextColor: string;
  buttonHoverTextColor: string;
  buttonBackgroundColor: string;
  buttonHoverBackgroundColor: string;
  buttonTextSize: string;
  buttonBorderColor: string;
  buttonRadius: string;
  buttonBorderWidth: string;
  buttonBorderStyle: string;
  buttonTextWeight: string;
  buttonAlign: string; //text-center, text-left, text-right
}

export type StepProgressBar = {
  stepType: "progressBar"
  px: string //tailwind px-2
  py: string //tailwind py-2
  verticalAlign: "items-center" | "items-start" | "items-end",
  horizontalAlign: "justify-center" | "justify-start" | "justify-end",
  currentStepIndex: number
  totalSteps: number
  progressBarType: string
}

export type StepInput = {
  stepType: "input"
  px: string //tailwind px-2
  py: string //tailwind py-2


  inputType: string // text, email, number, feedback
  inputLabel: boolean
  inputPlaceholder: string
  inputId: string
  inputName: string
  inputValue: string
  inputRequired: boolean
}


interface DemoPenguinContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: (buttonType: string) => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: Step[]) => void;
  steps: Step[];
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
  variables?: {
    [key: string]: string;
  };
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

  return {
    width: parseInt(step.width.replace("px", "")),
    height: parseInt(step.height.replace("px", ""))
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
  const scrollY = window.scrollY;
  const { width: contentWidth, height: contentHeight } = getStepDimensions(step);
  const MINIMUM_SPACE = PADDING * 2;

  // Calculate element position relative to viewport
  const elementViewportTop = elementPos.top - scrollY;

  // Calculate available space in each direction relative to viewport
  const spaceAbove = elementViewportTop;
  const spaceBelow = viewportHeight - (elementViewportTop + elementPos.height);
  const spaceLeft = elementPos.left;
  const spaceRight = viewportWidth - (elementPos.left + elementPos.width);

  // Calculate positions for each direction
  const positions = {
    top: {
      top: elementViewportTop - contentHeight - PADDING,
      left: elementPos.left + elementPos.width / 2 - contentWidth / 2,
      space: spaceAbove,
      fits: spaceAbove >= contentHeight + MINIMUM_SPACE
    },
    bottom: {
      top: elementViewportTop + elementPos.height + PADDING,
      left: elementPos.left + elementPos.width / 2 - contentWidth / 2,
      space: spaceBelow,
      fits: spaceBelow >= contentHeight + MINIMUM_SPACE
    },
    left: {
      top: elementViewportTop + elementPos.height / 2 - contentHeight / 2,
      left: elementPos.left - contentWidth - PADDING,
      space: spaceLeft,
      fits: spaceLeft >= contentWidth + MINIMUM_SPACE
    },
    right: {
      top: elementViewportTop + elementPos.height / 2 - contentHeight / 2,
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
    position: bestPosition
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

function scrollIntoViewIfNeeded(element: HTMLElement | null) {
  if (!element) return;

  // Get element's position relative to viewport
  const rect = element.getBoundingClientRect();
  
  // Check if element is fully visible in viewport
  const isInViewport = 
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  if (!isInViewport) {
    // Calculate ideal scroll position to center element
    const elementTop = rect.top + window.pageYOffset;
    const elementHeight = rect.height;
    const viewportHeight = window.innerHeight;
    const targetScrollTop = elementTop - (viewportHeight - elementHeight) / 2;

    // Smooth scroll to position
    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    // Add a small delay to ensure scroll completes before showing tooltip
    return new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return Promise.resolve();
}

const interpolateVariables = (text: string, variables?: { [key: string]: string }) => {
  if (!variables) return text;
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return variables[trimmedKey] || match; // Return original {{value}} if no variable found
  });
};

export function DemoPenguinProvider({
  children,
  onComplete,
  className,
  isTourCompleted = false,
  clientToken,
  userId,
  variables,
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
  const [developmentDomain, setDevelopmentDomain] = useState(false);
  const updateElementPosition = useCallback(async () => {
    if (currentStep >= 0 && currentStep < steps.length) {
      if (steps[currentStep]?.selectorId) {
        const element = document.getElementById(steps[currentStep]?.selectorId ?? "");
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

    return () => {
      window.removeEventListener("resize", updateElementPosition);
    };
  }, [updateElementPosition]);

  useEffect(() => {
    if (currentStep >= 0 && steps[currentStep]?.selectorId) {
      const element = document.getElementById(steps[currentStep].selectorId);
      scrollIntoViewIfNeeded(element);
    }
  }, [currentStep, steps]);

  const nextStep = useCallback(async (buttonType: string, navigationType: string = "internal", url: string = "") => {
    if (buttonType === "next") {
      const nextStepIndex = currentStep + 1;
      
      if (nextStepIndex >= steps.length) {
        setCurrentStep(-1);
        setIsTourCompleted(true);
        onComplete?.();
        return;
      }

      // Pre-scroll to next element before changing step
      if (steps[nextStepIndex]?.selectorId) {
        const nextElement = document.getElementById(steps[nextStepIndex].selectorId);
        await scrollIntoViewIfNeeded(nextElement);
      }

      setCurrentStep(nextStepIndex);
    }

    if (buttonType === "back") {
      if (currentStep > 0) {  
        const prevStepIndex = currentStep - 1;
        if (steps[prevStepIndex]?.selectorId) {
          const prevElement = document.getElementById(steps[prevStepIndex].selectorId);
          await scrollIntoViewIfNeeded(prevElement);
        }
        setCurrentStep(prevStepIndex);
      }
    }

    if (buttonType === "skip") {
      setCurrentStep(-1);
      setIsTourCompleted(true);
      onComplete?.();
    }
    if (buttonType === "navigate") {

      if (navigationType === "internal") {
        window.location.href = url;
      } else {
        window.open("https://" + url, '_blank');
      }
    }
  }, [steps, currentStep, onComplete]);

  const previousStep = useCallback(async () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      
      if (steps[prevStepIndex]?.selectorId) {
        const prevElement = document.getElementById(steps[prevStepIndex].selectorId);
        await scrollIntoViewIfNeeded(prevElement);
      }

      setCurrentStep(prevStepIndex);
    }
  }, [currentStep, steps]);

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
      if (currentStep >= 0 && elementPosition){ //&& steps[currentStep]?.onClickWithinArea) {
        const clickX = e.clientX + window.scrollX;
        const clickY = e.clientY + window.scrollY;

        const isWithinBounds =
          clickX >= elementPosition.left &&
          clickX <= elementPosition.left + (elementPosition.width) &&
          clickY >= elementPosition.top &&
          clickY <= elementPosition.top + (elementPosition.height);

        if (isWithinBounds) {
          //steps[currentStep].onClickWithinArea?.();
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
        'demopenguin-variables': JSON.stringify(variables || {})
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

  const renderRowItems = (row: StepRow, rowIndex: number) => {

    return row.rowItems.map((item: any, itemIndex: number) => (
      <div
        className={`slot flex flex-col justify-center`}
        key={`step-row-slot-${rowIndex}-${itemIndex}`}
      >
        {
          item.stepType === "text" && (
            <>
              <h2
                onClick={() => {
                  if (item.link) {
                    window.open("https://" + item.link, '_blank')
                  }
                }}
                style={{
                  color: item.textColor
                }}
                className={`
                        ${item.paddingTop}
                        ${item.paddingBottom}
                        ${item.paddingLeft}
                        ${item.paddingRight}
                        ${item.textWeight}
                        ${item.textSize}
                        ${item.textSpacing}
                        ${item.textAlign}
                        item
                `}
              >
                {interpolateVariables(item.text, variables)}
              </h2>
            </>
          )
        }
        {
          item.stepType === "image" && (
            <div
              className={`
                                        ${item.px}
                                        ${item.py}
                                        ${item.height}
                                        ${item.width}
                                        ${item.imageRadius}
                                        item
                                    `}
            >
              {
                item.imageUrl ? (
                  <img
                    style={{
                      borderColor: item.imageBorderColor,

                    }}
                    src={item.imageUrl}
                    className={`
                                        ${item.imageBackgroundColor}
                                        ${item.imageRadius}
                                        ${item.objectFit}
                                        ${item.imageBorderWidth}

                                `}
                  ></img>
                )
                  :
                  <div
                    style={{
                      borderColor: item.imageBorderColor,

                    }}
                    className={`relative w-full h-full aspect-video
                                    ${item.imageBorderWidth}
                                    ${item.imageBackgroundColor}
                                    ${item.imageRadius}
                                    ${item.objectFit}
                                    `}>
                    <VideoPlayer src={item.videoUrl} thumbnailSrc={item.thumbnailUrl} rounded={item.imageRadius} />
                  </div>
              }
            </div>
          )
        }
        {
          item.stepType === "button" && (
            <div
              onClick={() => nextStep(item.buttonType, item.navigation.type, item.navigation.url)}
              className={`
                        h-full w-full
                        ${item.buttonAlign}
                    `}>
              
              <button
                style={{
                  color: item.buttonTextColor,
                  backgroundColor: item.buttonBackgroundColor,
                  borderColor: item.buttonBorderColor,


                }}
                className={`
                        ${item.px}
                        ${item.py}
                        ${item.onHover}
                        ${item.buttonHoverTextColor}
                        ${item.buttonHoverBackgroundColor}
                        ${item.buttonTextSize}
                        ${item.buttonRadius}
                        ${item.buttonBorderWidth}
                        ${item.buttonBorderStyle}
                        ${item.buttonTextWeight}
                        ${item.buttonAlign}
                        `}
              >
                {item.text}
              </button>
            </div>
          )
        }

        {
          item.stepType === "progressBar" && (
            <div
              className={`
                        ${item.px}
                        ${item.py}
                        h-full w-full min-h-5 item
                        flex flex-row
                        ${item.verticalAlign}
                        ${item.horizontalAlign}
                        `}
            >
              {progressBarItems.find(bar => bar.value === item.progressBarType)?.component({ currentStepIndex: currentStep, totalSteps: steps.length })}
            </div>
          )
        }
      </div >
    ));
  };

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
                className={`fixed inset-0 z-50 overflow-hidden`}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: elementPosition?.top,
                  left: elementPosition?.left,
                  width: elementPosition?.width,
                  height: elementPosition?.height,
                  pointerEvents: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: steps[currentStep]?.backdrop ? '0 0 0 9999px rgba(0, 0, 0, 0.5)' : 'none'
                }}
                className={cn(
                  "z-[100] rounded-sm border-2 border-primary",
                  className
                )}
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
                  position: "fixed",
                  transform: elementPosition ? 'none' : 'none'
                }}
                className="bg-transparent relative z-[100] w-fit p-0"
              >
                <AnimatePresence mode="wait">
                  <div
                    style={{
                      width: steps[currentStep]?.width,
                      height: steps[currentStep]?.height,
                      background: steps[currentStep]?.cardBackgroundColor,
                      borderColor: steps[currentStep]?.cardBorderColor
                    }}
                    className={`
                ${steps[currentStep]?.px}
                ${steps[currentStep]?.py}
                ${steps[currentStep]?.cardShadowSize}
                ${steps[currentStep]?.cardBorderWidth}
                ${steps[currentStep]?.cardBorderStyle}
                ${steps[currentStep]?.cardRadius}
                
                ${steps[currentStep]?.onHover}
                flex flex-col gap-1
                justify-between
                transition-all duration-300
                
            `}>
                    {
                      steps[currentStep]?.rows.map((row, rowIndex) => (
                        <div
                          key={`step-row-${rowIndex}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${row.rowItems.length}, minmax(0, 1fr))`
                          }}
                          className={`
                    w-full 
                    ${row.rowGap}
                    ${row.paddingTop}
                    ${row.paddingBottom}
                    ${row.paddingLeft}
                    ${row.paddingRight}
                    group 
                    relative 
                  `}
                        >
                          {renderRowItems(row, rowIndex)}
                        </div>
                      ))
                    }
                  </div>

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


