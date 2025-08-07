import React, { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Trade } from '../types/trade';

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface DayData {
  pnl: number;
  trades: number;
  hasActivity: boolean;
}

interface CalendarWidgetProps {
  trades?: Trade[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar data from trades
  const calendarData = useMemo(() => {
    const data: Record<string, DayData> = {};
    
    trades.forEach(trade => {
      if (!trade.date) return;
      
      const tradeDate = new Date(trade.date);
      const dateString = tradeDate.toISOString().split('T')[0];
      
      if (dateString) {
        if (!data[dateString]) {
          data[dateString] = { pnl: 0, trades: 0, hasActivity: false };
        }
        data[dateString].pnl += trade.pnl || 0;
        data[dateString].trades += 1;
        data[dateString].hasActivity = true;
      }
    });
    
    return data;
  }, [trades]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startCalendar);
      date.setDate(date.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      
      days.push({
        date,
        dateString: date.toISOString().split('T')[0] as string,
        isCurrentMonth,
        isToday
      });
    }
    
    return days;
  }, [currentDate]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let monthlyPnL = 0;
    let totalTrades = 0;
    
    trades.forEach(trade => {
      if (!trade.date) return;
      
      const tradeDate = new Date(trade.date);
      if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
        monthlyPnL += trade.pnl || 0;
        totalTrades += 1;
      }
    });
    
    return { monthlyPnL, totalTrades };
  }, [trades, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayClassName = (dayData: DayData) => {
    if (!dayData.hasActivity) return '';
    return dayData.pnl >= 0 
      ? 'bg-green-50 border-green-200' 
      : 'bg-red-50 border-red-200';
  };

  const handleDayClick = (date: Date) => {
    // Handle day click - could open day details modal
    console.log('Clicked date:', date);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
          {calendarDays.map((day) => {
            const dayData = calendarData[day.dateString] || {
              pnl: 0,
              trades: 0,
              hasActivity: false
            };

            return (
              <div
                key={day.dateString}
                className={`
                  relative p-1 border border-border/20 rounded-md flex flex-col min-h-[60px]
                  ${getDayClassName(dayData)}
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  ${day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                  cursor-pointer hover:bg-accent/50 transition-colors
                `}
                onClick={() => handleDayClick(day.date)}
              >
                <div className="text-xs font-medium mb-auto">
                  {day.date.getDate()}
                </div>
                
                {dayData.hasActivity && (
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={dayData.pnl >= 0 ? "default" : "destructive"}
                        className="text-xs px-1 py-0 h-4"
                      >
                        {dayData.pnl >= 0 ? '+' : ''}${dayData.pnl.toFixed(0)}
                      </Badge>
                    </div>
                    {dayData.trades > 0 && (
                      <div className="text-center text-muted-foreground">
                        {dayData.trades} trade{dayData.trades !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/20 flex-shrink-0">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">Monthly P&L</div>
          <div className={`text-lg font-bold ${monthlyStats.monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyStats.monthlyPnL >= 0 ? '+' : ''}${monthlyStats.monthlyPnL.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">Total Trades</div>
          <div className="text-lg font-bold text-foreground">
            {monthlyStats.totalTrades}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
