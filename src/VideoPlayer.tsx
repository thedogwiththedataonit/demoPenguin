"use client"

import React, { useState } from "react"
import { Play } from "lucide-react"

interface VideoPlayerProps {
  src: string
  thumbnailSrc?: string
  type?: string
  width?: number
  height?: number
  rounded?: string
}

export default function VideoPlayer({
  src,
  thumbnailSrc,
  type = "video/mp4",
  width = 854,
  height = 480,
  rounded = "rounded-md"
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <>
      {!isPlaying && thumbnailSrc ? (
        <div className={`absolute inset-0 ${rounded} overflow-hidden`}>
          <img
            src={thumbnailSrc || "/placeholder.svg"}
            alt="Video thumbnail"
            className={`object-cover ${rounded}`}
            
          />
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 hover:bg-opacity-50 transition-opacity duration-300"
            aria-label="Play video"
          >
            <Play className="w-10 h-10 text-white/80" />
          </button>
        </div>
      ) : (
        <video 
          controls 
          autoPlay={isPlaying} 
          //loop
          preload="metadata"
          className={`absolute inset-0 w-full h-full ${rounded} object-cover`}
        >
          <source src={src} type={type} />
          Your browser does not support the video tag.
        </video>
      )}
    </>
  )
}

