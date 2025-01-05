import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { cn } from "./utils"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { ArrowRight } from "lucide-react";
import './styles.css';


interface DemoPenguinProps {
    clientToken: string;
    userId: string;
    userInfo: any;
    devMode?: boolean;
    className?: string;
}


export interface DialogResponse {
    status: "active" | "inactive";
    steps: Step[]; //array of steps, could be one
}

export interface Step {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
}

const DEMO_PENGUIN_API_URL = "https://www.demopenguin.com/api/v1/get/application";
const DEMO_PENGUIN_API_URL_DEV = "http://localhost:3000/api/v1/get/application";
function DemoPenguin({ clientToken, userId, userInfo, devMode = false, className = '' }: DemoPenguinProps) {
    // Initialize state
    console.log("DemoPenguin initialized with:", { clientToken, userId, userInfo });
    const [step, setStep] = useState(1);
    const [isOpen, setIsOpen] = useState(true);
    const [dialog, setDialog] = useState<Step[] | null>(null);


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
                if (data.status === "inactive") {
                    setIsOpen(false);
                } else {
                    setDialog(data.steps);
                    setStep(1);
                    setIsOpen(true);
                }
            })
            .catch(error => console.error('Error:', error));
    }, []);

    
    if (!dialog || dialog.length === 0) {
        return null;
    }

    const handleContinue = () => {
        if (step < dialog.length) {
            setStep(step + 1);
        }
    };


    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) setStep(1);
            }}
        >
            <DialogContent className="bg-white gap-0 p-0 [&>button:last-child]:text-white">
                <div className="p-2 flex justify-center items-center">
                    {
                        dialog[step - 1].imageUrl && (
                            <img
                                className="w-full  rounded-lg"
                                src={dialog[step - 1].imageUrl}
                                alt="dialog"
                            />
                        )
                    }

                </div>
                <div className="space-y-6 px-6 pb-6 pt-3">
                    <DialogHeader>
                        <DialogTitle>{dialog[step - 1].title}</DialogTitle>
                        <DialogDescription>{dialog[step - 1].description}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex justify-center space-x-1.5 max-sm:order-1">
                            {[...Array(dialog.length)].map((_, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full bg-primary",
                                        index + 1 === step ? "bg-primary" : "opacity-20",
                                    )}
                                />
                            ))}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Skip
                                </Button>
                            </DialogClose>
                            {step < dialog.length ? (
                                <Button className="group" type="button" onClick={handleContinue}>
                                    Next
                                    <ArrowRight
                                        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            ) : (
                                <DialogClose asChild>
                                    <Button type="button">Okay</Button>
                                </DialogClose>
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DemoPenguin;
export { DemoPenguin };



