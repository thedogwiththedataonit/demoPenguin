"use client"

import { DemoPenguinProvider } from "./DemoPenguinProvider"
import React from "react" 

interface DemoPenguinProps {
  children: React.ReactNode;
  clientToken: string;
  userId?: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  additionalInfo?: any;
  devMode?: boolean;
}
/*
const steps: DemoPenguinStep[] = [
  {
    id: "welcome!",
    imageUrl: "/crash.png",
    title: "Welcome asda hehe wtf",
    description: "Take a quick tour to learn about the key features and functionality of this application."
  },

  {
    id: "team-switcher",
    imageUrl: "/crash.png",
    title: "Team Switcher",
    description: "Team Switcher",
    selectorId: TOUR_STEP_IDS.TEAM_SWITCHER,
    position: "right",
    onClickWithinArea: () => { },
  },
  {
      id: "writing-area",
    imageUrl: "/crash.png",
    title: 'Great progress!',
    description: 'Now let\'s look at...'
  },
  {
    id: "writing-area",
    imageUrl: "/crash.png",
    title: "Writing Area",
    description: "Writing Area",
    selectorId: TOUR_STEP_IDS.WRITING_AREA,
    position: "left",
    onClickWithinArea: () => { },
  },
  {
    id: "ask-ai",
    imageUrl: "/crash.png",
    title: "Ask AI",
    description: "Ask AI",
    selectorId: TOUR_STEP_IDS.ASK_AI,
    position: "bottom",
    onClickWithinArea: () => { },
  },
  {
    id: "favorites",
    imageUrl: "/crash.png",
    title: "Quicly access your favorite pages",
    description: "Quicly access your favorite pages",
    selectorId: TOUR_STEP_IDS.FAVORITES,
    position: "right",
    onClickWithinArea: () => { },
  },
];
*/

export function DemoPenguin({ children, clientToken, userId, userEmail, firstName, lastName, additionalInfo, devMode = false }: DemoPenguinProps) {
  return (
    <DemoPenguinProvider  
      clientToken={clientToken} 
      userId={userId} 
      userEmail={userEmail} 
      firstName={firstName} 
      lastName={lastName} 
      additionalInfo={additionalInfo} 
      devMode={devMode || false}>      
      {children}
    </DemoPenguinProvider>
  )
}
