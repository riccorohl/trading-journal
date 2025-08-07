"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { Trade } from '../types/trade'

interface CalendarWidgetProps {
  trades?: Trade[]
}

export default function CalendarWidget({ trades = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and calculate calendar start
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [startDate])

  // Process trades data
  const tradesData = React.useMemo(() => {
    const data: Record<string, { pnl: number; count: number }> = {}
    
    trades.forEach(trade => {
      const date = new Date(trade.date).toDateString()
      if (!data[date]) {
        data[date] = { pnl: 0, count: 0 }
      }
      data[date].pnl += trade.pnl || 0
      data[date].count += 1
    })

    return data
  }, [trades])

  // Calculate monthly stats
  const monthlyStats = React.useMemo(() => {
    const currentMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date)
      return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear
    })

    const totalPnl = currentMonthTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const totalTrades = currentMonthTrades.length

    return { totalPnl, totalTrades }
  }, [trades, currentMonth, currentYear])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }

  const getDayData = (date: Date) => {
    return tradesData[date.toDateString()] || { pnl: 0, count: 0 }
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="w-full h-full p-4 flex flex-col">
      {/* Month Navigation and Summary */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Monthly Summary - Top Right */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Monthly P&L</div>
              <div className={`text-sm font-bold ${monthlyStats.totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                {monthlyStats.totalPnl >= 0 ? "+" : ""}${monthlyStats.totalPnl.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Total Trades</div>
              <div className="text-sm font-bold">{monthlyStats.totalTrades}</div>
            </div>
            
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3 flex-shrink-0">
          {dayHeaders.map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Flexible height */}
        <div className="grid grid-cols-7 gap-1 flex-1 mb-6">
          {calendarDays.map((date, index) => {
            const dayData = getDayData(date)
            const hasActivity = dayData.count > 0
            const isProfitDay = dayData.pnl > 0
            const isLossDay = dayData.pnl < 0

            return (
              <div
                key={index}
                className={`
                  min-h-[50px] p-2 border rounded-md flex flex-col items-center justify-center text-sm
                  ${isCurrentMonth(date) ? "bg-background" : "bg-muted/30 text-muted-foreground"}
                  ${isToday(date) ? "bg-primary text-primary-foreground font-semibold" : ""}
                  ${hasActivity && isProfitDay ? "bg-green-50 border-green-200" : ""}
                  ${hasActivity && isLossDay ? "bg-red-50 border-red-200" : ""}
                  cursor-pointer hover:bg-accent transition-colors
                `}
              >
                <span className={isToday(date) ? "text-primary-foreground" : ""}>{date.getDate()}</span>
                {hasActivity && (
                  <div className="text-xs mt-1">
                    <div className={`font-medium ${isProfitDay ? "text-green-600" : "text-red-600"}`}>
                      ${dayData.pnl.toFixed(0)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-sm flex-shrink-0">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-muted-foreground">Profit Day</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-muted-foreground">Loss Day</span>
          </div>
        </div>
    </div>
  )
}
