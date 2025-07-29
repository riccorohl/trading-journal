import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useTradeContext } from '../contexts/TradeContext';
import { useNavigate } from 'react-router-dom';
import { Trade } from '../types/trade';
import DayTradesModal from './DayTradesModal';
import AccountSelector from './AccountSelector';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu';
import { Plus, Settings, X } from 'lucide-react';
import { WIDGET_REGISTRY, DEFAULT_ACTIVE_WIDGETS, getWidgetById, getAvailableWidgets } from '../lib/widgetRegistry';

// Force reload - Updated with invisible subtitle technique

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const DashboardV2 = () => {
  const { trades } = useTradeContext();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_ACTIVE_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);

  // Event handlers
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setIsDayModalOpen(false);
    setSelectedDate('');
  };

  const handleDayTradeClick = (trade: Trade) => {
    setIsDayModalOpen(false);
    navigate(`/trade/${trade.id}`);
  };

  const handleTradeClick = (trade: Trade) => {
    navigate(`/trade/${trade.id}`);
  };

  // Widget management
  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Calculate metrics (same as original Dashboard)
  const metrics = useMemo(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined);
    
    if (closedTrades.length === 0) {
      return {
        netPnL: 0,
        tradeExpectancy: 0,
        profitFactor: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        totalTrades: 0,
        zellaScore: 0
      };
    }

    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
    const netPnL = totalPnL - totalCommissions;
    
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const grossWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    const winRate = (winningTrades.length / closedTrades.length) * 100;
    const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0;
    const tradeExpectancy = closedTrades.length > 0 ? netPnL / closedTrades.length : 0;
    
    // Simple Zella Score calculation (0-100)
    const zellaScore = Math.min(100, Math.max(0, 
      (winRate * 0.3) + 
      (Math.min(profitFactor * 10, 50) * 0.4) + 
      (Math.min(avgWin / Math.max(avgLoss, 1), 10) * 0.3 * 10)
    ));

    return {
      netPnL,
      tradeExpectancy,
      profitFactor,
      winRate,
      avgWin,
      avgLoss,
      totalTrades: closedTrades.length,
      zellaScore
    };
  }, [trades]);

  // Generate layout for active widgets
  const generateLayout = (): Layout[] => {
    let currentY = 0;
    let currentX = 0;
    const maxCols = 10;

    return activeWidgets.map(widgetId => {
      const widget = getWidgetById(widgetId);
      if (!widget) return { i: widgetId, x: 0, y: 0, w: 2, h: 2 };

      const layout = {
        i: widgetId,
        x: currentX,
        y: currentY,
        w: widget.defaultLayout.w,
        h: widget.defaultLayout.h,
        minW: widget.minSize.w,
        minH: widget.minSize.h
      };

      // Update position for next widget
      currentX += widget.defaultLayout.w;
      if (currentX >= maxCols) {
        currentX = 0;
        currentY += widget.defaultLayout.h;
      }

      return layout;
    });
  };

  const availableWidgets = getAvailableWidgets(activeWidgets);

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Customizable trading dashboard
            </p>
          </div>
          
          {/* Dashboard Controls */}
          <div className="flex items-center space-x-3">
            {/* Add Widget Dropdown */}
            {availableWidgets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(
                    availableWidgets.reduce((acc, widget) => {
                      if (!acc[widget.category]) acc[widget.category] = [];
                      acc[widget.category].push(widget);
                      return acc;
                    }, {} as Record<string, typeof availableWidgets>)
                  ).map(([category, widgets]) => (
                    <div key={category}>
                      <DropdownMenuLabel className="text-xs text-gray-500 uppercase">
                        {category}
                      </DropdownMenuLabel>
                      {widgets.map(widget => (
                        <DropdownMenuItem 
                          key={widget.id}
                          onClick={() => addWidget(widget.id)}
                          className="flex flex-col items-start"
                        >
                          <span className="font-medium">{widget.title}</span>
                          <span className="text-xs text-gray-500">{widget.description}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Edit Mode Toggle */}
            <Button 
              variant={isEditMode ? "default" : "outline"} 
              size="sm"
              onClick={toggleEditMode}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEditMode ? 'Done Editing' : 'Edit Layout'}
            </Button>
          </div>
        </div>

        {/* Account Selector */}
        <AccountSelector />

        {/* Edit Mode Notice */}
        {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Edit Mode:</strong> Drag to rearrange widgets, resize by dragging corners, or click the X to remove widgets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid Layout */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <ResponsiveReactGridLayout
            className="layout"
            layouts={{ lg: generateLayout() }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 10, md: 8, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            margin={[16, 16]}
          >
            {activeWidgets
              .map(widgetId => getWidgetById(widgetId))
              .filter((widget): widget is NonNullable<typeof widget> => widget !== undefined)
              .map(widget => {
                const WidgetComponent = widget.component;
                
                return (
                  <div key={widget.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative flex flex-col">
                    {/* Remove Widget Button (only in edit mode) */}
                    {isEditMode && (
                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeWidget(widget.id);
                        }}
                        className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
                        style={{ 
                          width: '28px', 
                          height: '28px',
                          transform: 'translate(50%, -50%)'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Widget Content */}
                    <WidgetComponent
                      metrics={metrics}
                      trades={trades}
                      handleTradeClick={handleTradeClick}
                      onDateClick={handleDateClick}
                      size={{ w: widget.defaultLayout.w, h: widget.defaultLayout.h }}
                    />
                  </div>
                );
              })}
          </ResponsiveReactGridLayout>
        </div>
      </div>

      {/* Day Trades Modal */}
      {isDayModalOpen && (
        <DayTradesModal
          isOpen={isDayModalOpen}
          onClose={handleCloseDayModal}
          date={selectedDate}
          trades={trades.filter(trade => trade.date === selectedDate)}
          onTradeClick={handleDayTradeClick}
        />
      )}
    </>
  );
};

export default DashboardV2;
