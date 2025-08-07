import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTradeContext } from '../contexts/TradeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trade } from '../types/trade';
import DayTradesModal from './DayTradesModal';
import AccountSelector from './AccountSelector';
import { DEFAULT_MAIN_WIDGETS, getAvailableWidgets } from '../lib/widgetRegistry';
import { dashboardService } from '../lib/dashboardService';
import WidgetWrapper from './ui/WidgetWrapper';
import EmptyWidgetSlot from './ui/EmptyWidgetSlot';
import { useDashboardConfig } from '../hooks/useDashboardConfig';
import DashboardWidget from './DashboardWidget';

const DashboardV2 = () => {
  const { trades } = useTradeContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
  // State for the customizable grid - now 2 slots with calendar in first slot
  const [mainWidgets, setMainWidgets] = useState<(string | null)[]>([...DEFAULT_MAIN_WIDGETS.slice(0, 1), null]);
  
  // State for customizable top metrics widgets
  const { getSelectedWidgets, updateWidget } = useDashboardConfig();
  
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);

  // Event handlers
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => setIsDayModalOpen(false);
  const handleTradeClick = (trade: Trade) => navigate(`/trade/${trade.id}`);

  // Load user's saved layout
  useEffect(() => {
    const loadUserLayout = async () => {
      if (!user?.uid) {
        setIsLoadingLayout(false);
        return;
      }
      try {
        const savedLayout = await dashboardService.getUserLayout(user.uid);
        if (savedLayout && savedLayout.mainWidgets.length > 0) {
          // Filter out widgets we don't want (performanceChart, zellaScore, recentTrades) and limit to calendar only
          let filteredWidgets = savedLayout.mainWidgets.filter(w => 
            w === 'calendar'
          );
          
          // If we don't have the calendar widget, add it
          if (!filteredWidgets.includes('calendar')) {
            filteredWidgets = ['calendar'];
          }
          
          // Ensure we have exactly 2 slots: calendar in first, empty in second
          const paddedWidgets: (string | null)[] = [filteredWidgets[0] || 'calendar', null];
          setMainWidgets(paddedWidgets);
        }
      } catch (error) {
        console.error('Error loading dashboard layout:', error);
      } finally {
        setIsLoadingLayout(false);
      }
    };
    loadUserLayout();
  }, [user?.uid]);

  // Debounced save function
  const debouncedSave = useCallback((() => {
    let timeoutId: NodeJS.Timeout;
    return (widgets: (string | null)[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (!user?.uid) return;
        try {
          // Filter out null values for saving
          const validWidgets = widgets.filter((w): w is string => w !== null);
          await dashboardService.saveUserLayout(user.uid, [], validWidgets);
        } catch (error) {
          console.error('Error saving dashboard layout:', error);
        }
      }, 1000);
    };
  })(), [user?.uid]);

  // Widget management for the static 2x2 grid
  const addWidgetToSlot = (widgetId: string, slotIndex?: number) => {
    const newWidgets = [...mainWidgets];
    
    if (slotIndex !== undefined) {
      // Add to specific slot
      newWidgets[slotIndex] = widgetId;
    } else {
      // Find first empty slot
      const emptySlotIndex = newWidgets.findIndex(w => w === null);
      if (emptySlotIndex !== -1) {
        newWidgets[emptySlotIndex] = widgetId;
      }
    }
    
    setMainWidgets(newWidgets);
    debouncedSave(newWidgets);
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = mainWidgets.map(w => w === widgetId ? null : w);
    setMainWidgets(newWidgets);
    debouncedSave(newWidgets);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const closedTradesWithPnL = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    if (closedTradesWithPnL.length === 0) return { netPnL: 0, tradeExpectancy: 0, profitFactor: 0, winRate: 0, avgWin: 0, avgLoss: 0, totalTrades: 0, zellaScore: 0 };
    const totalPnL = closedTradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winningTrades = closedTradesWithPnL.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTradesWithPnL.filter(t => (t.pnl || 0) < 0);
    const grossWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const winRate = (winningTrades.length / closedTradesWithPnL.length) * 100;
    const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0;
    const tradeExpectancy = totalPnL / closedTradesWithPnL.length;
    const zellaScore = Math.min(100, Math.max(0, (winRate * 0.3) + (Math.min(profitFactor * 10, 50) * 0.4) + (Math.min(avgWin / Math.max(avgLoss, 1), 10) * 0.3 * 10)));
    return { netPnL: totalPnL, tradeExpectancy, profitFactor, winRate, avgWin, avgLoss, totalTrades: closedTradesWithPnL.length, zellaScore };
  }, [trades]);

  const availableWidgets = getAvailableWidgets(mainWidgets.filter((w): w is string => w !== null));

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Your trading performance at a glance.</p>
          </div>
        </div>

        <AccountSelector />

        {/* Customizable Top Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getSelectedWidgets().map((widget, index) => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              trades={trades}
              position={index}
              onWidgetChange={(newWidgetId) => updateWidget(index, newWidgetId)}
            />
          ))}
        </div>

        {/* Static 1x2 Main Grid */}
        {!isLoadingLayout && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              {mainWidgets.map((widgetId, index) => (
                <div key={index} className="h-full min-h-0">
                  {widgetId ? (
                    <WidgetWrapper
                      widgetId={widgetId}
                      size={{ w: 6, h: 4 }}
                      onRemove={removeWidget}
                      metrics={metrics}
                      trades={trades}
                      handleTradeClick={(tradeId: string) => {
                        const trade = trades.find(t => t.id === tradeId);
                        if (trade) handleTradeClick(trade);
                      }}
                      onDateClick={handleDateClick}
                    />
                  ) : (
                    <EmptyWidgetSlot
                      onAddWidget={(newWidgetId) => addWidgetToSlot(newWidgetId, index)}
                      availableWidgets={availableWidgets}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDayModalOpen && <DayTradesModal isOpen={isDayModalOpen} onClose={handleCloseDayModal} date={selectedDate} trades={trades.filter(t => t.date === selectedDate)} onTradeClick={handleTradeClick} />}
    </>
  );
};

export default DashboardV2;
