import React from 'react';
import { Trade } from '../types/trade';

export interface TableColumn {
  id: string;
  label: string;
  field: keyof Trade | string;
  category: 'basic' | 'pricing' | 'position' | 'risk' | 'analysis' | 'timing';
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, trade: Trade) => React.ReactNode;
  sortable?: boolean;
  required?: boolean; // Can't be hidden
}

export const AVAILABLE_COLUMNS: TableColumn[] = [
  // Basic Information
  {
    id: 'currencyPair',
    label: 'Currency Pair',
    field: 'currencyPair',
    category: 'basic',
    width: '140px',
    sortable: true,
    required: true,
    format: (value: string) => value || '--'
  },
  {
    id: 'date',
    label: 'Date',
    field: 'date',
    category: 'basic',
    width: '120px',
    sortable: true,
    required: true,
    format: (value: string) => {
      if (!value) return '--';
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
      });
    }
  },
  {
    id: 'side',
    label: 'Side',
    field: 'side',
    category: 'basic',
    width: '100px',
    align: 'center',
    format: (value: string) => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        value === 'long' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {value?.toUpperCase() || '--'}
      </span>
    )
  },
  {
    id: 'status',
    label: 'Status',
    field: 'status',
    category: 'basic',
    width: '100px',
    align: 'center',
    format: (value: string) => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        value === 'closed' 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {value?.toUpperCase() || 'OPEN'}
      </span>
    )
  },

  // Pricing Information
  {
    id: 'entryPrice',
    label: 'Entry',
    field: 'entryPrice',
    category: 'pricing',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? value.toFixed(5) : '--'
  },
  {
    id: 'exitPrice',
    label: 'Exit',
    field: 'exitPrice',
    category: 'pricing',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? value.toFixed(5) : '--'
  },
  {
    id: 'spread',
    label: 'Spread',
    field: 'spread',
    category: 'pricing',
    width: '100px',
    align: 'right',
    format: (value: number) => value ? `${value.toFixed(1)} pips` : '--'
  },
  {
    id: 'pips',
    label: 'Pips',
    field: 'pips',
    category: 'pricing',
    width: '100px',
    align: 'right',
    format: (value: number) => {
      if (value === undefined || value === null) return '--';
      return (
        <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value >= 0 ? '+' : ''}{value.toFixed(1)}
        </span>
      );
    }
  },
  {
    id: 'pnl',
    label: 'P&L',
    field: 'pnl',
    category: 'pricing',
    width: '120px',
    align: 'right',
    format: (value: number) => {
      if (value === undefined || value === null) return '--';
      return (
        <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value >= 0 ? '+' : ''}${value.toFixed(2)}
        </span>
      );
    }
  },

  // Position Information
  {
    id: 'lotSize',
    label: 'Lot Size',
    field: 'lotSize',
    category: 'position',
    width: '120px',
    format: (value: number, trade: Trade) => (
      <div className="flex flex-col items-center">
        <span className="font-medium">{value || '--'}</span>
        <span className="text-xs text-gray-500 capitalize">{trade.lotType || ''}</span>
      </div>
    )
  },
  {
    id: 'units',
    label: 'Units',
    field: 'units',
    category: 'position',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? value.toLocaleString() : '--'
  },
  {
    id: 'leverage',
    label: 'Leverage',
    field: 'leverage',
    category: 'position',
    width: '100px',
    align: 'right',
    format: (value: number) => value ? `${value}:1` : '--'
  },
  {
    id: 'marginUsed',
    label: 'Margin',
    field: 'marginUsed',
    category: 'position',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? `$${value.toFixed(2)}` : '--'
  },

  // Risk Management
  {
    id: 'stopLoss',
    label: 'Stop Loss',
    field: 'stopLoss',
    category: 'risk',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? value.toFixed(5) : '--'
  },
  {
    id: 'takeProfit',
    label: 'Take Profit',
    field: 'takeProfit',
    category: 'risk',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? value.toFixed(5) : '--'
  },
  {
    id: 'riskAmount',
    label: 'Risk Amount',
    field: 'riskAmount',
    category: 'risk',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? `$${value.toFixed(2)}` : '--'
  },
  {
    id: 'rMultiple',
    label: 'R-Multiple',
    field: 'rMultiple',
    category: 'risk',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? `${value.toFixed(2)}R` : '--'
  },
  {
    id: 'commission',
    label: 'Commission',
    field: 'commission',
    category: 'risk',
    width: '120px',
    align: 'right',
    format: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
  },
  {
    id: 'swap',
    label: 'Swap',
    field: 'swap',
    category: 'risk',
    width: '100px',
    align: 'right',
    format: (value: number) => {
      if (!value) return '--';
      return (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value >= 0 ? '+' : ''}${value.toFixed(2)}
        </span>
      );
    }
  },

  // Timing Information
  {
    id: 'timeIn',
    label: 'Time In',
    field: 'timeIn',
    category: 'timing',
    width: '100px',
    align: 'center',
    format: (value: string) => value || '--'
  },
  {
    id: 'timeOut',
    label: 'Time Out',
    field: 'timeOut',
    category: 'timing',
    width: '100px',
    align: 'center',
    format: (value: string) => value || '--'
  },
  {
    id: 'session',
    label: 'Session',
    field: 'session',
    category: 'timing',
    width: '120px',
    align: 'center',
    format: (value: string) => (
      <span className="capitalize text-sm">
        {value || '--'}
      </span>
    )
  },

  // Analysis Information
  {
    id: 'strategy',
    label: 'Strategy',
    field: 'strategy',
    category: 'analysis',
    width: '140px',
    format: (value: string) => (
      <span className="text-sm" title={value}>
        {value ? (value.length > 15 ? `${value.substring(0, 15)}...` : value) : '--'}
      </span>
    )
  },
  {
    id: 'marketConditions',
    label: 'Market Conditions',
    field: 'marketConditions',
    category: 'analysis',
    width: '160px',
    format: (value: string) => (
      <span className="text-sm" title={value}>
        {value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : '--'}
      </span>
    )
  },
  {
    id: 'timeframe',
    label: 'Timeframe',
    field: 'timeframe',
    category: 'analysis',
    width: '100px',
    align: 'center',
    format: (value: string) => value || '--'
  },
  {
    id: 'confidence',
    label: 'Confidence',
    field: 'confidence',
    category: 'analysis',
    width: '100px',
    align: 'center',
    format: (value: number) => value ? `${value}/10` : '--'
  },
  {
    id: 'emotions',
    label: 'Emotions',
    field: 'emotions',
    category: 'analysis',
    width: '120px',
    format: (value: string) => (
      <span className="text-sm capitalize">
        {value || '--'}
      </span>
    )
  }
];

// Default visible columns (matching current implementation)
export const DEFAULT_VISIBLE_COLUMNS = [
  'currencyPair',
  'date',
  'side',
  'entryPrice',
  'exitPrice',
  'lotSize',
  'pips',
  'pnl',
  'status'
];

// Group columns by category
export const COLUMN_CATEGORIES = {
  basic: 'Basic Information',
  pricing: 'Pricing & Performance',
  position: 'Position Details',
  risk: 'Risk Management',
  timing: 'Timing',
  analysis: 'Analysis & Strategy'
};

// Get columns by category
export const getColumnsByCategory = () => {
  return Object.keys(COLUMN_CATEGORIES).reduce((acc, category) => {
    acc[category as keyof typeof COLUMN_CATEGORIES] = AVAILABLE_COLUMNS.filter(
      col => col.category === category
    );
    return acc;
  }, {} as Record<keyof typeof COLUMN_CATEGORIES, TableColumn[]>);
};

// Get column by ID
export const getColumnById = (id: string): TableColumn | undefined => {
  return AVAILABLE_COLUMNS.find(col => col.id === id);
};
