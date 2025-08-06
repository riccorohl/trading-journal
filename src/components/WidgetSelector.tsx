import React, { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '../config/dashboardConfig';

interface WidgetSelectorProps {
  position: number;
  currentWidgetId: string;
  onWidgetChange: (widgetId: string) => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ 
  position, 
  currentWidgetId, 
  onWidgetChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = {
    performance: 'Performance',
    risk: 'Risk Management', 
    analytics: 'Analytics',
    activity: 'Activity'
  };

  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category]!.push(widget);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_WIDGETS>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title={`Configure widget ${position + 1}`}
      >
        <Settings className="w-4 h-4" />
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">
                Select Widget {position + 1}
              </h3>
            </div>
            
            {Object.entries(categories).map(([categoryKey, categoryLabel]) => (
              <div key={categoryKey} className="p-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                  {categoryLabel}
                </div>
                <div className="space-y-1">
                  {groupedWidgets[categoryKey]?.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => {
                        onWidgetChange(widget.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        currentWidgetId === widget.id
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{widget.label}</div>
                      {widget.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {widget.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WidgetSelector;
