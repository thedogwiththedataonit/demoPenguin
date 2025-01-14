"use client"
import { DemoPenguinAlertDialog, DemoPenguinStep, useDemoPenguin } from "./DemoPenguinProvider"
import React, { useEffect, useState } from "react"


const DEMO_PENGUIN_API_URL = "https://www.demopenguin.com/api/v1/get/application";
const DEMO_PENGUIN_API_URL_DEV = "http://localhost:3000/api/v1/get/application";

export function Penguin({  clientToken, userId, userInfo, devMode }: {  clientToken: string, userId: string, userInfo: any, devMode: boolean }) {    
    
    const [openDemoPenguin, setOpenDemoPenguin] = useState(false);
    const { setSteps } = useDemoPenguin();
    
    useEffect(() => {
      console.log("DemoPenguin initialized with:", { clientToken, userId, userInfo });
      //get the current window url pathname
      const currentUrl = window.location.pathname;
      console.log("Current URL:", currentUrl);
      fetch(devMode ? DEMO_PENGUIN_API_URL_DEV : DEMO_PENGUIN_API_URL, {
          headers: {
              'demopenguin-client-token': clientToken,
              'demopenguin-pathname': currentUrl
          }
      })
          .then(response => response.json())
          .then(data => {
              //data is type Application
              //setApplication(data);
              //if data.status is inactive, setIsOpen to false
              console.log("Data:", data);
              const selectorId = data.selectorId
              console.log("SelectorId:", selectorId);
              if (data.status === "inactive") {
                  console.log("DemoPenguin is inactive");
              } else {
                  setSteps(data.steps);
                  console.log("DemoPenguin is active");
              }
          })
          .catch(error => console.error('Error:', error));
  }, []);



    return (
        <DemoPenguinAlertDialog isOpen={openDemoPenguin} setIsOpen={setOpenDemoPenguin} />
    )
}