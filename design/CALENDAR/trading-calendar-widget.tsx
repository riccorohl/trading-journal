"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Trade } from '../types/trade'

// The required props interface
interface CalendarWidgetProps {
  trades?: Trade[]
  onDateClick: (date: string) => void
}

interface CalendarDay {
  date: number
  fullDate: string // ISO date string
  pnl: number
  tradeCount: number
  isToday: boolean
  isCurrentMonth: boolean
}

const generateCalendarData = (year: number, month: number, trades: Trade[]): CalendarDay[] => {
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: CalendarDay[] = []
  const today = new Date()
  
  // Group trades by date
  const tradesByDate = trades.reduce((acc, trade) => {
    const dateKey = trade.date.split('T')[0] // Get just the date part
    if (!acc[dateKey]) {
      acc[dateKey] = { pnl: 0, count: 0 }
    }
    acc[dateKey].pnl += trade.pnl
    acc[dateKey].count += 1
    return acc
  }, {} as Record<string, { pnl: number; count: number }>)
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const dateString = currentDate.toISOString().split('T')[0]
    const dayData = tradesByDate[dateString] || { pnl: 0, count: 0 }
    
    days.push({
      date: currentDate.getDate(),
      fullDate: dateString,
      pnl: dayData.pnl,
      tradeCount: dayData.count,
      isToday: currentDate.toDateString() === today.toDateString(),
      isCurrentMonth: currentDate.getMonth() === month
    })
  }
  
  return days
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// The component must use this signature
export default function CalendarWidget({ trades = [], onDateClick }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAnimating, setIsAnimating] = useState(false)
  const [animatingDate, setAnimatingDate] = useState<Date | null>(null)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  
  const currentCalendarDays = generateCalendarData(currentDate.getFullYear(), currentDate.getMonth(), trades)
  const animatingCalendarDays = animatingDate ? generateCalendarData(animatingDate.getFullYear(), animatingDate.getMonth(), trades) : []
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (isAnimating) return
    
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    
    setAnimatingDate(newDate)
    setSlideDirection(direction === 'next' ? 'left' : 'right')
    setIsAnimating(true)
    
    setTimeout(() => {
      setCurrentDate(newDate)
      setAnimatingDate(null)
      setSlideDirection(null)
      setIsAnimating(false)
    }, 300)
  }
  
  const goToToday = () => {
    if (isAnimating) return
    setCurrentDate(new Date())
  }

  const getDayClassName = (day: CalendarDay) => {
    let className = "h-10 w-10 text-sm border-0 transition-colors flex items-center justify-center rounded-md "
    
    if (!day.isCurrentMonth) {
      className += "text-muted-foreground/40 "
    } else {
      className += "text-foreground "
    }
    
    if (day.isToday) {
      className += "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold "
    } else if (day.tradeCount > 0 && day.isCurrentMonth) {
      if (day.pnl > 0) {
        className += "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium cursor-pointer "
      } else {
        className += "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium cursor-pointer "
      }
    } else {
      className += "hover:bg-muted/50 "
    }
    
    return className
  }

  const renderCalendar = (days: CalendarDay[], dateKey: string) => (
    <div className="space-y-2">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={`${dateKey}-${index}`}
            className={getDayClassName(day)}
            type="button"
            onClick={() => onDateClick(day.fullDate)}
          >
            {day.date}
          </button>
        ))}
      </div>
    </div>
  )

  // Calculate monthly P&L
  const displayDate = isAnimating && animatingDate ? animatingDate : currentDate
  const displayDays = isAnimating && animatingDate ? animatingCalendarDays : currentCalendarDays
  const monthlyPnl = displayDays
    .filter(day => day.isCurrentMonth && day.tradeCount > 0)
    .reduce((sum, day) => sum + day.pnl, 0)

  const tradingDaysCount = displayDays.filter(day => day.isCurrentMonth && day.tradeCount > 0).length

  // The ideal JSX structure for the widget's return statement
  return (
    // The root element is a simple div that fills its parent's height
    <div className="flex flex-col h-full">
      {/* --- Top Section (Navigation, Summary) --- */}
      {/* This part should have a fixed height and not grow */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Trading Calendar
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on trading days to view details
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h4 className="text-lg font-semibold min-w-[140px] text-center">
              {months[displayDate.getMonth()]} {displayDate.getFullYear()}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
              disabled={isAnimating}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            disabled={isAnimating}
          >
            Today
          </Button>
        </div>
      </div>

      {/* --- Main Content Area (The Calendar Grid) --- */}
      {/* This is the key: `flex-1` makes this section grow and shrink
          to fill all available vertical space */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative overflow-hidden h-full min-h-[280px]">
          {/* Current Calendar */}
          <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            !isAnimating ? 'translate-x-0' :
            slideDirection === 'left' ? '-translate-x-full' : 'translate-x-full'
          }`}>
            {renderCalendar(currentCalendarDays, `current-${currentDate.getMonth()}`)}
          </div>
          
          {/* Animating Calendar */}
          {isAnimating && animatingDate && (
            <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              slideDirection === 'left' ? 'translate-x-full' : '-translate-x-full'
            } ${isAnimating ? 'translate-x-0' : ''}`}>
              {renderCalendar(animatingCalendarDays, `animating-${animatingDate.getMonth()}`)}
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Section (Legend & Summary) --- */}
      {/* This part also has a fixed height */}
      <div className="flex-shrink-0 p-4 border-t bg-background">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-muted-foreground">Profit Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-muted-foreground">Loss Day</span>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Trading Days</div>
            <div className="text-lg font-semibold">{tradingDaysCount}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Monthly P&L</div>
            <div className={`text-lg font-semibold ${monthlyPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
