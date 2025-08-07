import React from 'react';
import { DashboardWidget as WidgetConfig } from '../config/dashboardConfig';
import { Trade } from '../types/trade';
import WidgetSelector from './WidgetSelector';
import { TrendingUp, TrendingDown, Target, Trophy, DollarSign, BarChart3 } from 'lucide-react';

interface DashboardWidgetProps {
  widget: WidgetConfig;
  trades: Trade[];
  position: number;
  onWidgetChange: (widgetId: string) => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, 
  trades, 
  position, 
  onWidgetChange
}) => {
  const data = widget.getValue(trades);
  
  const getVariantStyles = (color?: string) => {
    switch (color) {
      case 'green':
        return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50";
      case 'red':
        return "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50";
      case 'blue':
        return "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50";
      default:
        return "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950";
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'netPnl':
        return <DollarSign className="h-4 w-4" />;
      case 'tradeExpectancy':
        return <Target className="h-4 w-4" />;
      case 'profitFactor':
        return <BarChart3 className="h-4 w-4" />;
      case 'winRate':
        return <Trophy className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getProgressBarColor = (color?: string) => {
    switch (color) {
      case 'green':
        return "bg-green-600";
      case 'red':
        return "bg-red-600";
      case 'blue':
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className={`transition-all hover:shadow-md rounded-xl border py-6 shadow-sm relative group ${getVariantStyles(data.color)}`}>
      {/* Edit button shows on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <WidgetSelector
          position={position}
          currentWidgetId={widget.id}
          onWidgetChange={onWidgetChange}
        />
      </div>
      
      {/* Header */}
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {widget.label}
        </h3>
        <div className="flex items-center space-x-2">
          {getIcon(widget.id) && (
            <div className="text-gray-500 dark:text-gray-400">
              {getIcon(widget.id)}
            </div>
          )}
          {getTrendIcon(data.trend)}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6">
        <div className="space-y-2">
          <div className="text-2xl font-bold">{data.value}</div>
          {data.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{data.subtitle}</p>
          )}
          {data.progress !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700 relative overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(data.color)} absolute top-0 left-0 progress-bar`}
                  data-progress={Math.min(data.progress, 100)}
                />
              </div>
              <div className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-white border-gray-200">
                {Math.round(data.progress)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget;
