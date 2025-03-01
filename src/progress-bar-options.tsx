import React from "react";
const ProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    return <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
}

const ProgressLabel = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    return <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">{currentStepIndex + 1} of {totalSteps}</span>
    </div>
}

const ProgressDots = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    return <div className="flex items-center space-x-2">
        {[...Array(totalSteps)].map((_, index) => (
            <div
                key={index}
                className={`w-2 h-2 rounded-full 
                    ${index <= currentStepIndex ? "bg-blue-500" : "bg-gray-300"}
                    transition-all  ease-in-out
                    ${index === currentStepIndex ? "scale-125 animate-pulse" : ""}`}
            ></div>
        ))}
    </div>
}

const stripedProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                    width: `${progress}%`,
                    backgroundImage:
                        "linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)",
                    backgroundSize: "1rem 1rem",
                }}
            ></div>
        </div>
    )
}

const gradientProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    )
}

const labelProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {currentStepIndex + 1 === totalSteps ? 'Final Step' : 'In Progress'}
                </span>
                <span className="text-xs font-semibold inline-block text-blue-600">{Math.round(progress)}%</span>
            </div>

            <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
            </div>
        </div>
    )
}

const circleProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    const circumference = 2 * Math.PI * 40; // 2πr where r=40
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-gray-200 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                ></circle>
                <circle
                    className="text-blue-600 progress-ring__circle stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                ></circle>
                <text
                    x="50"
                    y="50"
                    fontFamily="Verdana"
                    fontSize="20"
                    textAnchor="middle"
                    alignmentBaseline="central"
                >
                    {Math.round(progress)}%
                </text>
            </svg>
        </div>
    )
}

const animatedProgressBar = ({ currentStepIndex, totalSteps }: { currentStepIndex: number, totalSteps: number }) => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
                className="bg-green-500 h-2 rounded-full animate-pulse"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    )
}

export const progressBarItems = [
    { value: "default", label: "Default", component: ProgressBar },
    { value: "label", label: "Label", component: ProgressLabel },
    { value: "dots", label: "Dots", component: ProgressDots },
    { value: "striped", label: "Striped", component: stripedProgressBar },
    { value: "gradient", label: "Gradient", component: gradientProgressBar },
    { value: "label-progress-bar", label: "Label Progress Bar", component: labelProgressBar },
    { value: "circle", label: "Circle", component: circleProgressBar },
    { value: "animated", label: "Animated", component: animatedProgressBar },
];