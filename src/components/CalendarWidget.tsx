import React, { useState } from 'react';
import { Calendar, momentLocalizer, EventProps, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Trade } from '../types/trade';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    pnl: number;
    tradeCount: number;
  };
}

interface CalendarWidgetProps {
  trades: Trade[];
  onDateClick?: (date: string) => void;
  size: { w: number; h: number };
}

// Custom Event component to render P&L
const CustomEvent: React.FC<EventProps<CalendarEvent>> = ({ event }) => {
  const { pnl, tradeCount } = event.resource;
  const isProfit = pnl >= 0;
  
  return (
    <div className={`h-full w-full flex flex-col justify-center items-center p-1 rounded-md ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <div className="font-bold text-sm">
        {isProfit ? '+' : ''}${pnl.toFixed(0)}
      </div>
      <div className="text-xs opacity-80">
        {tradeCount} {tradeCount > 1 ? 'trades' : 'trade'}
      </div>
    </div>
  );
};

// Custom Toolbar with navigation buttons
const CustomToolbar: React.FC<{ 
  date: Date; 
  onNavigate: (date: Date) => void; 
}> = ({ date, onNavigate }) => {
  const navigateBack = () => {
    const newDate = moment(date).subtract(1, 'month').toDate();
    onNavigate(newDate);
  };

  const navigateForward = () => {
    const newDate = moment(date).add(1, 'month').toDate();
    onNavigate(newDate);
  };

  const navigateToday = () => {
    onNavigate(new Date());
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={navigateForward}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900">
        {moment(date).format('MMMM YYYY')}
      </h3>
      
      <Button
        variant="outline"
        size="sm"
        onClick={navigateToday}
        className="text-xs"
      >
        Today
      </Button>
    </div>
  );
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ trades, onDateClick, size }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Process trades into daily P&L events
  const events = React.useMemo(() => {
    const dailyData: { [key: string]: { pnl: number; tradeCount: number } } = {};

    trades.forEach(trade => {
      if (trade.status === 'closed' && trade.pnl !== undefined && trade.date) {
        const date = trade.date;
        if (!dailyData[date]) {
          dailyData[date] = { pnl: 0, tradeCount: 0 };
        }
        dailyData[date].pnl += trade.pnl;
        dailyData[date].tradeCount += 1;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      title: `${data.pnl >= 0 ? '+' : ''}$${data.pnl.toFixed(0)}`,
      start: moment(date).toDate(),
      end: moment(date).toDate(),
      allDay: true,
      resource: data,
    }));
  }, [trades]);

  // 2. Handle day selection
  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => {
    if (onDateClick && slotInfo.action === 'click') {
      const dateString = moment(slotInfo.start).format('YYYY-MM-DD');
      onDateClick(dateString);
    }
  };

  // 3. Custom styling for the calendar components
  const components = {
    event: CustomEvent,
    toolbar: (props: ToolbarProps<CalendarEvent>) => <CustomToolbar {...props} onNavigate={setCurrentDate} />,
  };

  // 4. Custom styling for the calendar grid cells based on P&L
  const dayPropGetter = (date: Date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    const dayTrades = trades.filter(t => t.date === dateString && t.status === 'closed');
    if (dayTrades.length === 0) return {};

    const totalPnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    if (totalPnl > 0) {
      return {
        className: 'bg-green-50 hover:bg-green-100 transition-colors',
      };
    } else if (totalPnl < 0) {
      return {
        className: 'bg-red-50 hover:bg-red-100 transition-colors',
      };
    }
    return {};
  };

  return (
    <div className="h-full w-full flex flex-col">
      <style>{`
        .rbc-calendar {
          height: 100%;
          width: 100%;
          flex: 1;
        }
        .rbc-month-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .rbc-month-header {
          flex-shrink: 0;
        }
        .rbc-month-view .rbc-row {
          flex: 1;
          min-height: 0;
        }
        .rbc-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 4px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-month-row {
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          flex: 1;
        }
        .rbc-row-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .rbc-date-cell {
          padding: 4px;
          font-size: 0.75rem;
          color: #374151;
        }
        .rbc-off-range {
          color: #9ca3af;
        }
        .rbc-today {
          background-color: #dbeafe;
        }
        .rbc-event {
          border: none;
          box-shadow: none;
          padding: 0;
          margin: 1px;
        }
      `}</style>
      <div className="flex-1 min-h-0">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={setCurrentDate}
          style={{ height: '100%', width: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          views={['month']}
          view="month"
          components={components}
          dayPropGetter={dayPropGetter}
        />
      </div>
    </div>
  );
};

export default CalendarWidget;
