import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from './dropdown-menu';
import { getAvailableWidgets } from '../../lib/widgetRegistry';

interface EmptyWidgetSlotProps {
  onAddWidget: (widgetId: string) => void;
  availableWidgets: ReturnType<typeof getAvailableWidgets>;
}

const EmptyWidgetSlot: React.FC<EmptyWidgetSlotProps> = ({ onAddWidget, availableWidgets }) => {
  return (
    <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <Plus className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-sm text-gray-500 mb-4">Empty widget slot</p>
        {availableWidgets.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64">
              <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableWidgets.map(widget => (
                <DropdownMenuItem 
                  key={widget.id} 
                  onClick={() => onAddWidget(widget.id)} 
                  className="flex flex-col items-start"
                >
                  <span className="font-medium">{widget.title}</span>
                  <span className="text-xs text-gray-500">{widget.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-xs text-gray-400">All widgets are in use</p>
        )}
      </div>
    </div>
  );
};

export default EmptyWidgetSlot;
