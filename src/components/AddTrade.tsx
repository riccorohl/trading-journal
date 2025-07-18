
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Calculator, ChevronDown, ChevronUp, Zap, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade, TradeFormData } from '../types/trade';
import { toast } from '../hooks/use-toast';
import { getTodayDate } from '../lib/dateUtils';

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

const quickTradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  date: z.string().min(1, 'Date is required'),
  timeIn: z.string().min(1, 'Time in is required'),
  side: z.enum(['long', 'short']),
  pnlAmount: z.string().optional(),
  pnlPercentage: z.string().optional(),
  riskAmount: z.string().optional(),
}).extend(tradeSchema.shape);

interface AddTradeProps {
  onClose: () => void;
}


      
const AddTrade: React.FC<AddTradeProps> = ({ onClose }) => {
        const { addTrade } = useTradeContext();
        
        // UI State
        const [entryMode, setEntryMode] = useState<'quick' | 'detailed'>('quick');
        const [showAdvanced, setShowAdvanced] = useState(false);
        const [pnlInputType, setPnlInputType] = useState<'amount' | 'percentage'>('amount');
        
        // Calculations
        const [calculatedPnL, setCalculatedPnL] = useState<number | null>(null);
        const [showCalculatedPnL, setShowCalculatedPnL] = useState(false);
      
        const form = useForm<TradeFormData & { pnlAmount?: string; pnlPercentage?: string }>({
          resolver: zodResolver(quickTradeSchema),
          defaultValues: {
            symbol: '',
            date: getTodayDate(),
            timeIn: new Date().toTimeString().slice(0, 5), // Current time HH:MM
            timeOut: '',
            side: 'long',
            pnlAmount: '',
            pnlPercentage: '',
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
      
        // Auto-calculate P&L from prices when in detailed mode
        useEffect(() => {
          if (entryMode === 'detailed') {
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
              setShowCalculatedPnL(true);
            } else {
              setCalculatedPnL(null);
              setShowCalculatedPnL(false);
            }
          }
        }, [watchedValues, entryMode]);
      
        const onSubmit = async (data: TradeFormData & { pnlAmount?: string; pnlPercentage?: string }) => {
          try {
            let finalPnL: number | undefined;
            
            // Determine P&L from different input methods
            if (entryMode === 'quick') {
              if (data.pnlAmount) {
                finalPnL = parseFloat(data.pnlAmount);
              } else if (data.pnlPercentage && data.riskAmount) {
                // Calculate P&L from percentage and risk amount
                const percentage = parseFloat(data.pnlPercentage);
                const risk = parseFloat(data.riskAmount);
                finalPnL = (percentage / 100) * risk;
              }
            } else {
              finalPnL = calculatedPnL || undefined;
            }
      
            const trade: Trade = {
              id: Date.now().toString(),
              symbol: data.symbol.toUpperCase(),
              date: data.date,
              timeIn: data.timeIn,
              timeOut: data.timeOut || undefined,
              side: data.side,
              entryPrice: data.entryPrice ? parseFloat(data.entryPrice) : undefined,
              exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : undefined,
              quantity: data.quantity ? parseFloat(data.quantity) : undefined,
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
              status: data.exitPrice || entryMode === 'quick' ? 'closed' : 'open',
              pnl: finalPnL,
            };
      
            // Calculate R-multiple if risk amount is provided
            if (trade.riskAmount && trade.pnl) {
              trade.rMultiple = trade.pnl / trade.riskAmount;
            }
      
            // Determine result
            if (trade.pnl !== undefined) {
              trade.result = trade.pnl > 0 ? 'WIN' : trade.pnl < 0 ? 'LOSS' : 'BREAKEVEN';
            }
      
            console.log('Attempting to add trade:', trade);
            await addTrade(trade);
            
            toast({
              title: "Trade Added Successfully! 🎉",
              description: `${trade.symbol} trade logged${trade.pnl !== undefined ? ` with ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)} P&L` : ''}`,
            });
            onClose();
          } catch (error) {
            console.error('Error adding trade:', error);
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to add trade. Please try again.",
              variant: "destructive",
            });
          }
        };
      
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header with Mode Toggle */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-bold text-gray-900">Add Trade</h2>
                  
                  {/* Quick/Detailed Toggle */}
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setEntryMode('quick')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        entryMode === 'quick' 
                          ? 'bg-white text-purple-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Zap className="w-4 h-4 inline mr-1" />
                      Quick
                    </button>
                    <button
                      onClick={() => setEntryMode('detailed')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        entryMode === 'detailed' 
                          ? 'bg-white text-purple-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Calculator className="w-4 h-4 inline mr-1" />
                      Detailed
                    </button>
                  </div>
                </div>
                
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
      
              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="text-center py-12 text-gray-500">
                      Component under development...
                    </div>
                  </form>
                </div>
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
                  {entryMode === 'quick' ? 'Quick Save' : 'Save Trade'}
                </Button>
              </div>
            </div>
          </div>
        );
      };

export default AddTrade;
