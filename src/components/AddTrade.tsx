
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade, TradeFormData } from '../types/trade';
import { toast } from '../hooks/use-toast';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  date: z.string().min(1, 'Date is required'),
  timeIn: z.string().min(1, 'Time in is required'),
  timeOut: z.string().optional(),
  side: z.enum(['long', 'short']),
  entryPrice: z.string().min(1, 'Entry price is required'),
  exitPrice: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  commission: z.string().optional(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  strategy: z.string().optional(),
  marketConditions: z.string().optional(),
  timeframe: z.string().optional(),
  confidence: z.string().optional(),
  emotions: z.string().optional(),
  notes: z.string().optional(),
  riskAmount: z.string().optional(),
});

interface AddTradeProps {
  onClose: () => void;
}

const AddTrade: React.FC<AddTradeProps> = ({ onClose }) => {
  const { addTrade } = useTradeContext();
  const [currentTab, setCurrentTab] = useState('basic');
  const [calculatedPnL, setCalculatedPnL] = useState<number | null>(null);

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: '',
      date: new Date().toISOString().split('T')[0],
      timeIn: '',
      timeOut: '',
      side: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      commission: '0',
      stopLoss: '',
      takeProfit: '',
      strategy: '',
      marketConditions: '',
      timeframe: '',
      confidence: '',
      emotions: '',
      notes: '',
      riskAmount: '',
    },
  });

  const watchedValues = form.watch(['entryPrice', 'exitPrice', 'quantity', 'side', 'commission']);

  React.useEffect(() => {
    const [entryPrice, exitPrice, quantity, side, commission] = watchedValues;
    
    if (entryPrice && exitPrice && quantity) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseFloat(quantity);
      const comm = parseFloat(commission || '0');
      
      let pnl: number;
      if (side === 'long') {
        pnl = (exit - entry) * qty - comm;
      } else {
        pnl = (entry - exit) * qty - comm;
      }
      
      setCalculatedPnL(pnl);
    } else {
      setCalculatedPnL(null);
    }
  }, [watchedValues]);

  const onSubmit = (data: TradeFormData) => {
    const trade: Trade = {
      id: Date.now().toString(),
      symbol: data.symbol.toUpperCase(),
      date: data.date,
      timeIn: data.timeIn,
      timeOut: data.timeOut || undefined,
      side: data.side,
      entryPrice: parseFloat(data.entryPrice),
      exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : undefined,
      quantity: parseFloat(data.quantity),
      commission: parseFloat(data.commission || '0'),
      stopLoss: data.stopLoss ? parseFloat(data.stopLoss) : undefined,
      takeProfit: data.takeProfit ? parseFloat(data.takeProfit) : undefined,
      strategy: data.strategy || undefined,
      marketConditions: data.marketConditions || undefined,
      timeframe: data.timeframe || undefined,
      confidence: data.confidence ? parseFloat(data.confidence) : undefined,
      emotions: data.emotions || undefined,
      notes: data.notes || undefined,
      riskAmount: data.riskAmount ? parseFloat(data.riskAmount) : undefined,
      status: data.exitPrice ? 'closed' : 'open',
      pnl: calculatedPnL || undefined,
    };

    // Calculate R-multiple if risk amount is provided
    if (trade.riskAmount && trade.pnl) {
      trade.rMultiple = trade.pnl / trade.riskAmount;
    }

    addTrade(trade);
    toast({
      title: "Trade Added",
      description: `Successfully added ${trade.symbol} trade.`,
    });
    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'execution', label: 'Execution' },
    { id: 'management', label: 'Risk Management' },
    { id: 'psychology', label: 'Psychology & Notes' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Trade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium ${
                currentTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input
                      id="symbol"
                      {...form.register('symbol')}
                      placeholder="AAPL"
                      className="uppercase"
                    />
                    {form.formState.errors.symbol && (
                      <p className="text-sm text-red-600">{form.formState.errors.symbol.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register('date')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeIn">Time In *</Label>
                    <Input
                      id="timeIn"
                      type="time"
                      {...form.register('timeIn')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeOut">Time Out</Label>
                    <Input
                      id="timeOut"
                      type="time"
                      {...form.register('timeOut')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="side">Side *</Label>
                  <select
                    id="side"
                    {...form.register('side')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>
            )}

            {currentTab === 'execution' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryPrice">Entry Price *</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      {...form.register('entryPrice')}
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exitPrice">Exit Price</Label>
                    <Input
                      id="exitPrice"
                      type="number"
                      step="0.01"
                      {...form.register('exitPrice')}
                      placeholder="155.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...form.register('quantity')}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission/Fees</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      {...form.register('commission')}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {calculatedPnL !== null && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Calculated P&L:</span>
                      <span className={`font-bold ${calculatedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculatedPnL.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'management' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.01"
                      {...form.register('stopLoss')}
                      placeholder="145.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      step="0.01"
                      {...form.register('takeProfit')}
                      placeholder="160.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskAmount">Risk Amount</Label>
                    <Input
                      id="riskAmount"
                      type="number"
                      step="0.01"
                      {...form.register('riskAmount')}
                      placeholder="500.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Input
                      id="strategy"
                      {...form.register('strategy')}
                      placeholder="Breakout, Pullback, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <select
                      id="timeframe"
                      {...form.register('timeframe')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select timeframe</option>
                      <option value="1m">1 Minute</option>
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">Daily</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="marketConditions">Market Conditions</Label>
                    <select
                      id="marketConditions"
                      {...form.register('marketConditions')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select condition</option>
                      <option value="trending">Trending</option>
                      <option value="range">Range-bound</option>
                      <option value="volatile">Volatile</option>
                      <option value="quiet">Quiet</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'psychology' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="confidence">Confidence Level (1-10)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="1"
                    max="10"
                    {...form.register('confidence')}
                    placeholder="8"
                  />
                </div>

                <div>
                  <Label htmlFor="emotions">Emotions</Label>
                  <Input
                    id="emotions"
                    {...form.register('emotions')}
                    placeholder="Confident, Anxious, Calm, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...form.register('notes')}
                    placeholder="Trade rationale, market observations, lessons learned..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Trade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTrade;
