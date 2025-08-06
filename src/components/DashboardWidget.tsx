import React from 'react';
import { DashboardWidget as WidgetConfig } from '../config/dashboardConfig';
import { Trade } from '../types/trade';
import WidgetSelector from './WidgetSelector';

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
  
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  const getProgressColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'stroke-green-500';
      case 'red':
        return 'stroke-red-500';
      case 'blue':
        return 'stroke-blue-500';
      default:
        return 'stroke-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group">
      {/* Edit button shows on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <WidgetSelector
          position={position}
          currentWidgetId={widget.id}
          onWidgetChange={onWidgetChange}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{widget.label}</h3>
          <div className={`text-2xl font-bold ${getColorClasses(data.color)} leading-tight`}>
            {data.value}
          </div>
          {data.subtitle && (
            <div className="text-sm text-gray-500 mt-1">
              {data.subtitle}
            </div>
          )}
        </div>
        
        {data.progress !== undefined && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray={`${data.progress}, 100`}
                  className={getProgressColorClasses(data.color)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round(data.progress || 0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWidget;
