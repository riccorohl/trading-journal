import React from 'react';
import { Settings, Check, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { 
  COLUMN_CATEGORIES, 
  getColumnsByCategory, 
  TableColumn 
} from '../config/tableConfig';

interface ColumnSelectorProps {
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onReorderColumn?: (fromIndex: number, toIndex: number) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  visibleColumns,
  onToggleColumn,
  onReorderColumn
}) => {
  const columnsByCategory = getColumnsByCategory();

  const handleToggle = (columnId: string, column: TableColumn) => {
    // Prevent hiding required columns
    if (column.required && visibleColumns.includes(columnId)) {
      return;
    }
    onToggleColumn(columnId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="text-sm font-medium">
          Manage Table Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Show columns grouped by category */}
        {Object.entries(COLUMN_CATEGORIES).map(([categoryKey, categoryLabel]) => {
          const categoryColumns = columnsByCategory[categoryKey as keyof typeof COLUMN_CATEGORIES];
          
          if (!categoryColumns || categoryColumns.length === 0) return null;
          
          return (
            <div key={categoryKey}>
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1">
                {categoryLabel}
              </DropdownMenuLabel>
              
              {categoryColumns.map((column) => {
                const isVisible = visibleColumns.includes(column.id);
                const isRequired = column.required;
                
                return (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() => handleToggle(column.id, column)}
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 ${
                      isRequired && isVisible ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {onReorderColumn && (
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-sm">{column.label}</span>
                      {isRequired && (
                        <span className="text-xs text-gray-400">(required)</span>
                      )}
                    </div>
                    
                    {isVisible && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </div>
          );
        })}
        
        {/* Summary */}
        <div className="px-3 py-2 text-xs text-gray-500 border-t">
          {visibleColumns.length} of {Object.values(columnsByCategory).flat().length} columns visible
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
