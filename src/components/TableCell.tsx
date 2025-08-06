import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TableColumn } from '../config/tableConfig';
import { Trade } from '../types/trade';

interface TableCellProps {
  column: TableColumn;
  trade: Trade;
  onEdit?: (trade: Trade) => void;
  onDelete?: (trade: Trade) => void;
  onView?: (trade: Trade) => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  column,
  trade,
  onEdit,
  onDelete,
  onView,
}) => {
  // Handle special actions column
  if (column.id === 'actions') {
    return (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(trade);
              }}
              className="h-8 w-8 p-0"
              title="View Trade"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(trade);
              }}
              className="h-8 w-8 p-0"
              title="Edit Trade"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(trade);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
              title="Delete Trade"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    );
  }

  // Get the value from the trade object
  const getValue = (field: keyof Trade | string, trade: Trade): any => {
    if (typeof field === 'string' && field.includes('.')) {
      // Handle nested properties if needed in the future
      return field.split('.').reduce((obj: any, key: string) => obj?.[key], trade);
    }
    return trade[field as keyof Trade];
  };

  const value = getValue(column.field, trade);
  
  // Apply formatting if provided
  const formattedValue = column.format ? column.format(value, trade) : value;

  const cellClass = `px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900`;

  return (
    <td className={cellClass}>
      {formattedValue}
    </td>
  );
};
