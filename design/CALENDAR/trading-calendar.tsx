"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useState } from 'react'

interface TradingDay {
  date: number
  pnl?: number
  trades?: number
  isToday?: boolean
  isCurrentMonth?: boolean
}

const generateCalendarData = (year: number, month: number): TradingDay[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: TradingDay[] = []
  const today = new Date()
  
  // Sample trading data
  const tradingData: Record<string, { pnl: number; trades: number }> = {
    '6': { pnl: 450.20, trades: 3 },
    '12': { pnl: -120.50, trades: 2 },
    '15': { pnl: 890.75, trades: 5 },
    '22': { pnl: 234.10, trades: 1 },
    '28': { pnl: -67.30, trades: 2 },
  }
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const dayData = tradingData[currentDate.getDate().toString()]
    
    days.push({
      date: currentDate.getDate(),
      pnl: dayData?.pnl,
      trades: dayData?.trades,
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

export default function TradingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7)) // August 2025
  
  const calendarDays = generateCalendarData(currentDate.getFullYear(), currentDate.getMonth())
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDayClassName = (day: TradingDay) => {
    let className = "h-10 w-full text-sm border-0 hover:bg-muted/50 transition-colors "
    
    if (!day.isCurrentMonth) {
      className += "text-muted-foreground/50 "
    }
    
    if (day.isToday) {
      className += "bg-primary text-primary-foreground hover:bg-primary/90 "
    }
    
    if (day.pnl && day.isCurrentMonth) {
      if (day.pnl > 0) {
        className += "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 "
      } else {
        className += "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 "
      }
    }
    
    return className
  }

  // Calculate monthly P&L
  const monthlyPnl = calendarDays
    .filter(day => day.isCurrentMonth && day.pnl)
    .reduce((sum, day) => sum + (day.pnl || 0), 0)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Trading Calendar
          </CardTitle>
          <p className="text-sm text-muted-foreground">Calendar view of your trading activity</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold whitespace-nowrap">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday} className="shrink-0">
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={getDayClassName(day)}
              >
                {day.date}
              </Button>
            ))}
          </div>
        </div>

        {/* Simplified Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-muted-foreground">Profit Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-muted-foreground">Loss Day</span>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="text-center pt-2 border-t">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              Monthly P&L
            </div>
            <div className={`text-xl font-bold ${monthlyPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
