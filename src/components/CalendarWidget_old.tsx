import React, { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Trade } from '../types/trade';

interface TradingDay {
  date: number;
  pnl?: number;
  trades?: number;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  fullDate?: string;
}

interface CalendarWidgetProps {
  trades: Trade[];
  onDateClick?: (date: string) => void;
  size?: { w: number; h: number };
}

const generateCalendarData = (year: number, month: number, trades: Trade[]): TradingDay[] => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: TradingDay[] = [];
  const today = new Date();
  
  // Process trades into daily data
  const tradingData: Record<string, { pnl: number; trades: number }> = {};
  trades.forEach(trade => {
    if (trade.status === 'closed' && trade.pnl !== undefined && trade.date) {
      if (!tradingData[trade.date]) {
        tradingData[trade.date] = { pnl: 0, trades: 0 };
      }
      const dayData = tradingData[trade.date];
      if (dayData) {
        dayData.pnl += trade.pnl;
        dayData.trades += 1;
      }
    }
  });
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const dayData = dateString ? tradingData[dateString] : undefined;
    
    days.push({
      date: currentDate.getDate(),
      pnl: dayData?.pnl,
      trades: dayData?.trades,
      isToday: currentDate.toDateString() === today.toDateString(),
      isCurrentMonth: currentDate.getMonth() === month,
      fullDate: dateString
    });
  }
  
  return days;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const calendarDays = useMemo(() => 
    generateCalendarData(currentDate.getFullYear(), currentDate.getMonth(), trades),
    [currentDate, trades]
  );
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: TradingDay) => {
    if (onDateClick && day.fullDate && day.isCurrentMonth) {
      onDateClick(day.fullDate);
    }
  };

  const getDayClassName = (day: TradingDay) => {
    let className = "h-10 w-full text-sm border-0 hover:bg-muted/50 transition-colors ";
    
    if (!day.isCurrentMonth) {
      className += "text-muted-foreground/50 ";
    }
    
    if (day.isToday) {
      className += "bg-primary text-primary-foreground hover:bg-primary/90 ";
    }
    
    if (day.pnl && day.isCurrentMonth) {
      if (day.pnl > 0) {
        className += "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 ";
      } else {
        className += "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 ";
      }
    }
    
    return className;
  };

  // Calculate monthly P&L
  const monthlyPnl = calendarDays
    .filter(day => day.isCurrentMonth && day.pnl)
    .reduce((sum, day) => sum + (day.pnl || 0), 0);

  const totalTrades = calendarDays
    .filter(day => day.isCurrentMonth && day.trades)
    .reduce((sum, day) => sum + (day.trades || 0), 0);

  return (
    <div className="w-full h-full flex flex-col p-4 space-y-4">
      {/* Calendar Header - Just navigation, no title */}
      <div className="flex items-center justify-between flex-shrink-0">
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
        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 flex-shrink-0">
            {weekDays.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 flex-1 grid-rows-6">
            {calendarDays.map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={getDayClassName(day)}
                onClick={() => handleDayClick(day)}
              >
                {day.date}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend and Summary */}
        <div className="space-y-3 flex-shrink-0">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Monthly P&L
                </div>
                <div className={`text-lg font-bold ${monthlyPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Trades
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {totalTrades}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
