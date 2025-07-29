
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';

interface CalendarWidgetProps {
  trades: Array<{
    date: string;
    status: string;
    pnl?: number;
  }>;
  onDateClick?: (date: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades, onDateClick }) => {
  // trades now passed as prop
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Calculate daily P&L for the current month
  const getDailyPnL = (day: number) => {
    // Create date string in YYYY-MM-DD format to match trade.date format
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Calendar checking date:', dateString);
    
    const dayTrades = trades.filter(trade => {
      console.log('Trade date:', trade.date, 'Comparing with:', dateString);
      return trade.date === dateString && trade.status === 'closed';
    });
    
    console.log('Found trades for', dateString, ':', dayTrades.length);
    
    if (dayTrades.length === 0) return null;
    
    const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return {
      pnl: totalPnL,
      tradeCount: dayTrades.length
    };
  };

  // Calculate monthly stats
  const getMonthlyStats = () => {
    let totalPnL = 0;
    let tradingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dailyData = getDailyPnL(day);
      if (dailyData) {
        totalPnL += dailyData.pnl;
        tradingDays++;
      }
    }

    return { totalPnL, tradingDays };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number) => {
    // Create date string in YYYY-MM-DD format
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Calendar day clicked:', dateString);
    if (onDateClick) {
      onDateClick(dateString);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dailyData = getDailyPnL(day);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      let cellClass = "h-24 p-3 border-r border-b border-gray-100 cursor-pointer transition-colors relative";
      
      if (dailyData) {
        if (dailyData.pnl > 0) {
          cellClass += " bg-green-50 hover:bg-green-100";
        } else {
          cellClass += " bg-red-50 hover:bg-red-100";
        }
      } else {
        cellClass += " hover:bg-gray-100";
      }
      
      days.push(
        <div key={day} className={cellClass} onClick={() => handleDayClick(day)}>
          <div className="flex flex-col h-full">
            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </div>
            {dailyData && (
              <div className="flex-1 flex flex-col justify-center">
                <div className={`text-xs font-semibold ${dailyData.pnl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {dailyData.pnl >= 0 ? '+' : ''}{dailyData.pnl.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {dailyData.tradeCount} trade{dailyData.tradeCount === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>
          {isToday && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const monthlyStats = getMonthlyStats();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-4 md:mb-0">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h1>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Monthly PnL:</span>
            <span className={`text-sm font-semibold ${monthlyStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthlyStats.totalPnL >= 0 ? '+' : ''}{monthlyStats.totalPnL.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="flex-1 flex flex-col">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7">
          {daysOfWeek.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1">
          {renderCalendarDays()}
        </div>
      </div>
    </>
  );
};

export default CalendarWidget;
