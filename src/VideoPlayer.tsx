"use client"

import React, { useState } from "react"
import { Play } from "lucide-react"

interface VideoPlayerProps {
    src: string
    thumbnailSrc?: string
    type?: string
    width?: number
    height?: number
}

export default function VideoPlayer({
    src,
    thumbnailSrc,
    type = "video/mp4",
    width = 854,
    height = 480,
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlay = () => {
        setIsPlaying(true)
    }

    return (
        <div className="relative w-full h-full">
            {!isPlaying && thumbnailSrc ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img
                        src={thumbnailSrc}
                        className="rounded-lg w-full h-full object-cover" />

                    <button
                        onClick={handlePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 hover:bg-opacity-50 transition-opacity duration-300"
                        aria-label="Play video"
                    >
                        <Play className="w-10 h-10 text-white/80" />
                    </button>
                </div>
            ) : (
                <video width={width} height={height} controls autoPlay={isPlaying} preload="true" className="rounded-lg h-full w-full object-cover">
                    <source src={src} type={type} />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    )
}

