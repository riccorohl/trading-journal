
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';

interface CalendarWidgetProps {
  onDayClick?: (date: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onDayClick }) => {
  const { trades } = useTradeContext();
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
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrades = trades.filter(trade => trade.date === dateString && trade.status === 'closed');
    
    if (dayTrades.length === 0) return null;
    
    const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return {
      pnl: totalPnL,
      tradeCount: dayTrades.length
    };
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
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onDayClick) {
      onDayClick(dateString);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dailyData = getDailyPnL(day);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      let cellClass = "h-12 w-full border border-gray-200 text-xs relative cursor-pointer hover:bg-gray-50 transition-colors flex flex-col justify-center items-center";
      
      if (dailyData) {
        if (dailyData.pnl > 0) {
          cellClass += " bg-green-100 hover:bg-green-200";
        } else {
          cellClass += " bg-red-100 hover:bg-red-200";
        }
      }
      
      if (isToday) {
        cellClass += " ring-2 ring-blue-500 ring-inset";
      }
      
      days.push(
        <div 
          key={day} 
          className={cellClass}
          onClick={() => handleDayClick(day)}
        >
          <div className="font-medium text-gray-900 text-xs">{day}</div>
          {dailyData && (
            <div className="text-center">
              <div className={`font-bold text-xs ${dailyData.pnl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ${dailyData.pnl >= 0 ? '+' : ''}${dailyData.pnl.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 flex items-center">
          Trading Calendar
          <span className="ml-1 text-gray-400">ⓘ</span>
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {daysOfWeek.map(day => (
          <div key={day} className="h-8 text-center text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-gray-200 rounded"></div>
          <span className="text-xs text-gray-600">Winning Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-gray-200 rounded"></div>
          <span className="text-xs text-gray-600">Losing Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
          <span className="text-xs text-gray-600">No Trades</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
