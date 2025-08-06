import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_VISIBLE_COLUMNS } from '../config/tableConfig';

const STORAGE_KEY = 'tradeLog_columnConfig';

interface ColumnConfig {
  visibleColumns: string[];
  columnOrder: string[];
}

export const useColumnConfig = () => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const config: ColumnConfig = JSON.parse(stored);
        setVisibleColumns(config.visibleColumns || DEFAULT_VISIBLE_COLUMNS);
        setColumnOrder(config.columnOrder || DEFAULT_VISIBLE_COLUMNS);
      } catch (error) {
        console.error('Failed to parse stored column config:', error);
        // Reset to defaults if parsing fails
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
        setColumnOrder(DEFAULT_VISIBLE_COLUMNS);
      }
    }
  }, []);

  // Save configuration to localStorage whenever it changes
  const saveConfig = useCallback((newVisibleColumns: string[], newColumnOrder: string[]) => {
    const config: ColumnConfig = {
      visibleColumns: newVisibleColumns,
      columnOrder: newColumnOrder
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  // Toggle column visibility
  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns(current => {
      let newVisible: string[];
      
      if (current.includes(columnId)) {
        // Remove column
        newVisible = current.filter(id => id !== columnId);
      } else {
        // Add column
        newVisible = [...current, columnId];
      }
      
      // Update column order to include new columns at the end
      setColumnOrder(currentOrder => {
        const newOrder = currentOrder.includes(columnId) 
          ? currentOrder 
          : [...currentOrder, columnId];
        
        saveConfig(newVisible, newOrder);
        return newOrder;
      });
      
      return newVisible;
    });
  }, [saveConfig]);

  // Reorder columns
  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setColumnOrder(current => {
      const newOrder = [...current];
      const [movedColumn] = newOrder.splice(fromIndex, 1);
      
      if (movedColumn) {
        newOrder.splice(toIndex, 0, movedColumn);
      }
      
      saveConfig(visibleColumns, newOrder);
      return newOrder;
    });
  }, [visibleColumns, saveConfig]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    setColumnOrder(DEFAULT_VISIBLE_COLUMNS);
    saveConfig(DEFAULT_VISIBLE_COLUMNS, DEFAULT_VISIBLE_COLUMNS);
  }, [saveConfig]);

  // Get ordered visible columns
  const orderedVisibleColumns = columnOrder.filter(columnId => visibleColumns.includes(columnId));

  return {
    visibleColumns,
    columnOrder,
    orderedVisibleColumns,
    toggleColumn,
    reorderColumns,
    resetToDefaults
  };
};
