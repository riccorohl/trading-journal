
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react';
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

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const weeks = [];
    let currentWeekStartDay = 1 - startingDayOfWeek;
    let weekNumber = 1;

    while (currentWeekStartDay <= daysInMonth) {
      const weekEndDay = Math.min(currentWeekStartDay + 6, daysInMonth);
      let weekPnL = 0;
      let tradingDays = 0;

      // Sum P&L for days within the current week
      for (let day = Math.max(currentWeekStartDay, 1); day <= weekEndDay; day++) {
        const dailyData = getDailyPnL(day);
        if (dailyData) {
          weekPnL += dailyData.pnl;
          tradingDays++;
        }
      }

      // Calculate week date range for display
      const weekStartDate = Math.max(currentWeekStartDay, 1);
      const weekEndDate = Math.min(weekEndDay, daysInMonth);

      weeks.push({
        week: weekNumber,
        pnl: weekPnL,
        tradingDays: tradingDays,
        startDate: weekStartDate,
        endDate: weekEndDate
      });

      currentWeekStartDay += 7;
      weekNumber++;
    }

    return weeks;
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
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onDayClick) {
      onDayClick(dateString);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dailyData = getDailyPnL(day);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      let cellClass = "h-16 p-2 border-r border-b border-gray-100 cursor-pointer transition-colors relative";
      
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
                  {dailyData.pnl >= 0 ? '+' : ''}${dailyData.pnl.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {dailyData.tradeCount} trade{dailyData.tradeCount === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>
          {isToday && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="bg-white min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex flex-wrap items-center space-x-3 sm:space-x-6 mb-4 md:mb-0">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h1>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium text-gray-700">This month</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Monthly stats:</span>
              <span className={`text-sm font-semibold ${monthlyStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthlyStats.totalPnL >= 0 ? '+' : ''}{monthlyStats.totalPnL.toFixed(0)}
              </span>
            </div>
            <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            <Info className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-t-lg overflow-hidden">
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-100 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l border-gray-100 rounded-b-lg overflow-hidden">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Weekly Performance Summary */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyStats.map((week) => (
              <div key={week.week} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Week {week.week}</h3>
                  <div className="text-xs text-gray-500">
                    {week.startDate === week.endDate 
                      ? `${week.startDate}`
                      : `${week.startDate}-${week.endDate}`
                    }
                  </div>
                </div>
                <div className={`text-xl font-bold mb-1 ${week.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {week.pnl >= 0 ? '+' : ''}${week.pnl.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">
                  {week.tradingDays} trading day{week.tradingDays === 1 ? '' : 's'}
                </div>
                {week.tradingDays > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Avg: ${(week.pnl / week.tradingDays).toFixed(0)}/day
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
