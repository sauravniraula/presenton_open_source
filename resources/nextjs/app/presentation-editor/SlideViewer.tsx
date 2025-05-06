'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function Component() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scripts, setScripts] = useState([
    "This is the script for slide 1...",
    "Script for slide 2...",
    "Script for slide 3..."
  ])

  const slides = [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600"
  ]

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : slides.length - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : 0))
  }

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newScripts = [...scripts]
    newScripts[currentSlide] = e.target.value
    setScripts(newScripts)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Card className="overflow-hidden">
          <div className="aspect-video relative bg-muted">
            <img
              src={slides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="p-4">
            <Textarea
              value={scripts[currentSlide]}
              onChange={handleScriptChange}
              placeholder="Enter script for this slide..."
              className="min-h-[100px] resize-none"
              aria-label={`Script for slide ${currentSlide + 1}`}
            />
          </div>
        </Card>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
          onClick={handleNextSlide}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Slide {currentSlide + 1} of {slides.length}
      </div>
    </div>
  )
}