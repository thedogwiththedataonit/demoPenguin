"use client"
import { DemoPenguinAlertDialog, DemoPenguinStep, useDemoPenguin } from "./DemoPenguinProvider"
import React, { useEffect, useState } from "react"



export function Penguin({ steps }: { steps: DemoPenguinStep[] }) {    
    const [openDemoPenguin, setOpenDemoPenguin] = useState(false);
    const { setSteps } = useDemoPenguin();
  
    useEffect(() => {
      setSteps(steps);
      const timer = setTimeout(() => {
        setOpenDemoPenguin(true)
      }, 100);
  
      return () => clearTimeout(timer);
    }, [setSteps]);
  

    return (
        <DemoPenguinAlertDialog isOpen={openDemoPenguin} setIsOpen={setOpenDemoPenguin} />
    )
}