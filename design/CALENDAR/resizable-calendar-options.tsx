"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useState } from 'react'

// Option 1: CSS Resize (simplest)
export function CSSResizableCalendar() {
  return (
    <div className="resize overflow-auto border rounded-lg min-w-[300px] min-h-[400px] max-w-[600px] max-h-[800px]">
      {/* Calendar content here */}
      <Card className="h-full w-full border-0">
        <CardHeader>
          <CardTitle>CSS Resizable Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Drag the bottom-right corner to resize</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Option 2: Custom Resize Handles
export function CustomResizableCalendar() {
  const [size, setSize] = useState({ width: 400, height: 500 })
  
  return (
    <div 
      className="relative border rounded-lg bg-background"
      style={{ width: size.width, height: size.height, minWidth: 300, minHeight: 400 }}
    >
      {/* Calendar content */}
      <Card className="h-full w-full border-0">
        <CardHeader>
          <CardTitle>Custom Resizable Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Custom resize handles on edges</p>
        </CardContent>
      </Card>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 bg-muted cursor-se-resize"
        onMouseDown={(e) => {
          const startX = e.clientX
          const startY = e.clientY
          const startWidth = size.width
          const startHeight = size.height
          
          const handleMouseMove = (e: MouseEvent) => {
            setSize({
              width: Math.max(300, startWidth + (e.clientX - startX)),
              height: Math.max(400, startHeight + (e.clientY - startY))
            })
          }
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }
          
          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      />
    </div>
  )
}

export default function ResizableCalendarOptions() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Option 1: CSS Resize (Simplest)</h2>
        <CSSResizableCalendar />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Option 2: Custom Resize Handles</h2>
        <CustomResizableCalendar />
      </div>
    </div>
  )
}
