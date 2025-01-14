"use client"

import { Penguin } from "./Penguin"
import { DemoPenguinProvider, DemoPenguinStep } from "./DemoPenguinProvider"
import React from "react"

export const TOUR_STEP_IDS = {
  TEAM_SWITCHER: "team-switcher",
  WRITING_AREA: "writing-area",
  ASK_AI: "ask-ai",
  FAVORITES: "favorites",
};

const steps: DemoPenguinStep[] = [
  {
    title: "Welcome lol",
    description: "Take a quick tour to learn about the key features and functionality of this application."
  },
  
  {
      title: "Team Switcher",
      description: "Team Switcher",
      selectorId: TOUR_STEP_IDS.TEAM_SWITCHER,
      position: "right",
      onClickWithinArea: () => { },
  },
  {
    title: 'Great progress!',
    description: 'Now let\'s look at...'
  },
  {
      title: "Writing Area",
      description: "Writing Area",
      selectorId: TOUR_STEP_IDS.WRITING_AREA,
      position: "left",
      onClickWithinArea: () => { },
  },
  {
      title: "Ask AI",
      description: "Ask AI",
      selectorId: TOUR_STEP_IDS.ASK_AI,
      position: "bottom",
      onClickWithinArea: () => { },
  },
  {
      title: "Quicly access your favorite pages",
      description: "Quicly access your favorite pages",
      selectorId: TOUR_STEP_IDS.FAVORITES,
      position: "right",
      onClickWithinArea: () => { },
  },
];

export function DemoPenguinInit( { children }: { children: React.ReactNode }) {
  return (
    <DemoPenguinProvider>
      <Penguin steps={steps} />
      {children}
    </DemoPenguinProvider>
  )
}
