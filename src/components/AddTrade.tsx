
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
import { Trade, TradeFormData, CURRENCY_PAIRS, TRADING_SESSIONS, LOT_SIZES, calculatePips, calculatePipValue } from '../types/trade';
import { toast } from '../hooks/use-toast';
import { getTodayDate } from '../lib/dateUtils';

const tradeSchema = z.object({
        currencyPair: z.string().min(1, 'Currency pair is required'),
        date: z.string().min(1, 'Date is required'),
        timeIn: z.string().min(1, 'Time in is required'),
        timeOut: z.string().optional(),
        session: z.enum(['asian', 'european', 'us', 'overlap']).optional(),
        side: z.enum(['long', 'short']),
        entryPrice: z.string().min(1, 'Entry price is required'),
        exitPrice: z.string().optional(),
        spread: z.string().optional(),
        lotSize: z.string().min(1, 'Lot size is required'),
        lotType: z.enum(['standard', 'mini', 'micro']),
        leverage: z.string().optional(),
        commission: z.string().optional(),
        swap: z.string().optional(),
        stopLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        accountCurrency: z.string().min(1, 'Account currency is required'),
        strategy: z.string().optional(),
        marketConditions: z.string().optional(),
        timeframe: z.string().optional(),
        confidence: z.string().optional(),
        emotions: z.string().optional(),
        notes: z.string().optional(),
        riskAmount: z.string().optional(),
      });

const quickTradeSchema = z.object({
        currencyPair: z.string().min(1, 'Currency pair is required'),
        date: z.string().min(1, 'Date is required'),
        timeIn: z.string().min(1, 'Time in is required'),
        side: z.enum(['long', 'short']),
        lotSize: z.string().min(1, 'Lot size is required'),
        lotType: z.enum(['standard', 'mini', 'micro']),
        accountCurrency: z.string().min(1, 'Account currency is required'),
        pnlAmount: z.string().optional(),
        pnlPercentage: z.string().optional(),
        riskAmount: z.string().optional(),
      }).extend(tradeSchema.shape);
;

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
            currencyPair: '',
            date: getTodayDate(),
            timeIn: new Date().toTimeString().slice(0, 5), // Current time HH:MM
            timeOut: '',
            session: 'european',
            side: 'long',
            pnlAmount: '',
            pnlPercentage: '',
            entryPrice: '',
            exitPrice: '',
            spread: '',
            lotSize: '0.1',
            lotType: 'standard',
            leverage: '30',
            commission: '0',
            swap: '',
            stopLoss: '',
            takeProfit: '',
            accountCurrency: 'USD',
            strategy: '',
            marketConditions: '',
            timeframe: '',
            confidence: '',
            emotions: '',
            notes: '',
            riskAmount: '',
          },
        });
      
        const watchedValues = form.watch(['entryPrice', 'exitPrice', 'lotSize', 'lotType', 'currencyPair', 'side', 'commission', 'accountCurrency']);
      
        // Auto-calculate P&L from prices when in detailed mode (Forex)
        useEffect(() => {
          if (entryMode === 'detailed') {
            const [entryPrice, exitPrice, lotSize, lotType, currencyPair, side, commission, accountCurrency] = watchedValues;
            
            if (entryPrice && exitPrice && lotSize && currencyPair && lotType) {
              const entry = parseFloat(entryPrice);
              const exit = parseFloat(exitPrice);
              const lots = parseFloat(lotSize);
              const comm = parseFloat(commission || '0');
              
              try {
                // Calculate pips
                const pips = calculatePips(entry, exit, currencyPair, side);
                
                // Calculate pip value
                const pipValue = calculatePipValue(currencyPair, lots, lotType as keyof typeof LOT_SIZES, accountCurrency);
                
                // Calculate P&L
                const pnl = (pips * pipValue) - comm;
                
                setCalculatedPnL(pnl);
                setShowCalculatedPnL(true);
              } catch (error) {
                console.error('Error calculating forex P&L:', error);
                setCalculatedPnL(null);
                setShowCalculatedPnL(false);
              }
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
      
            // Calculate forex-specific values
            let pips: number | undefined;
            let pipValue: number | undefined;
            let units: number | undefined;
            let marginUsed: number | undefined;
            
            if (data.currencyPair && data.lotSize && data.lotType) {
              const lots = parseFloat(data.lotSize);
              units = lots * LOT_SIZES[data.lotType as keyof typeof LOT_SIZES];
              
              if (data.entryPrice && data.exitPrice) {
                pips = calculatePips(
                  parseFloat(data.entryPrice), 
                  parseFloat(data.exitPrice), 
                  data.currencyPair, 
                  data.side
                );
                pipValue = calculatePipValue(
                  data.currencyPair, 
                  lots, 
                  data.lotType as keyof typeof LOT_SIZES, 
                  data.accountCurrency
                );
              }
              
              // Calculate margin used (simplified)
              if (data.leverage && data.entryPrice) {
                const leverage = parseFloat(data.leverage);
                const notionalValue = (parseFloat(data.entryPrice) * units);
                marginUsed = notionalValue / leverage;
              }
            }

            const trade: Trade = {
              id: Date.now().toString(),
              currencyPair: data.currencyPair.toUpperCase(),
              date: data.date,
              timeIn: data.timeIn,
              timeOut: data.timeOut || undefined,
              session: data.session as 'asian' | 'european' | 'us' | 'overlap' || 'european',
              side: data.side,
              entryPrice: data.entryPrice ? parseFloat(data.entryPrice) : 0,
              exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : undefined,
              spread: data.spread ? parseFloat(data.spread) : undefined,
              lotSize: parseFloat(data.lotSize),
              lotType: data.lotType as 'standard' | 'mini' | 'micro',
              units: units || 0,
              pips,
              pipValue,
              commission: parseFloat(data.commission || '0'),
              swap: data.swap ? parseFloat(data.swap) : undefined,
              stopLoss: data.stopLoss ? parseFloat(data.stopLoss) : undefined,
              takeProfit: data.takeProfit ? parseFloat(data.takeProfit) : undefined,
              leverage: data.leverage ? parseFloat(data.leverage) : undefined,
              marginUsed,
              accountCurrency: data.accountCurrency,
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
      

      
            console.log('Attempting to add trade:', trade);
            await addTrade(trade);
            
            toast({
              title: "Trade Added Successfully! 🎉",
              description: `${trade.currencyPair} trade logged${trade.pnl !== undefined ? ` with ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)} P&L` : ''}`,
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
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    {/* Currency Pair & Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Trade Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Currency Pair */}
                        <div>
                          <Label htmlFor="currencyPair">Currency Pair *</Label>
                          <select
                            {...form.register('currencyPair')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="">Select currency pair</option>
                            <optgroup label="Major Pairs">
                              {CURRENCY_PAIRS.MAJOR.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Minor Pairs">
                              {CURRENCY_PAIRS.MINOR.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Exotic Pairs">
                              {CURRENCY_PAIRS.EXOTIC.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                              ))}
                            </optgroup>
                          </select>
                          {form.formState.errors.currencyPair && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.currencyPair.message}</p>
                          )}
                        </div>

                        {/* Trading Session */}
                        <div>
                          <Label htmlFor="session">Trading Session</Label>
                          <select
                            {...form.register('session')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {Object.entries(TRADING_SESSIONS).map(([key, session]) => (
                              <option key={key} value={key}>{session.name} ({session.hours})</option>
                            ))}
                          </select>
                        </div>

                        {/* Trade Direction */}
                        <div>
                          <Label>Trade Direction *</Label>
                          <div className="mt-1 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => form.setValue('side', 'long')}
                              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                                form.watch('side') === 'long'
                                  ? 'bg-green-50 border-green-500 text-green-700'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              Long (Buy)
                            </button>
                            <button
                              type="button"
                              onClick={() => form.setValue('side', 'short')}
                              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                                form.watch('side') === 'short'
                                  ? 'bg-red-50 border-red-500 text-red-700'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <TrendingDown className="w-4 h-4 inline mr-1" />
                              Short (Sell)
                            </button>
                          </div>
                        </div>

                        {/* Account Currency */}
                        <div>
                          <Label htmlFor="accountCurrency">Account Currency *</Label>
                          <select
                            {...form.register('accountCurrency')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                            <option value="CHF">CHF</option>
                            <option value="CAD">CAD</option>
                            <option value="AUD">AUD</option>
                            <option value="NZD">NZD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Position Sizing */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Position Sizing
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Lot Size */}
                        <div>
                          <Label htmlFor="lotSize">Lot Size *</Label>
                          <Input
                            {...form.register('lotSize')}
                            type="number"
                            step="0.01"
                            placeholder="0.1"
                            className="mt-1"
                          />
                          {form.formState.errors.lotSize && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.lotSize.message}</p>
                          )}
                        </div>

                        {/* Lot Type */}
                        <div>
                          <Label htmlFor="lotType">Lot Type *</Label>
                          <select
                            {...form.register('lotType')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="standard">Standard (100k)</option>
                            <option value="mini">Mini (10k)</option>
                            <option value="micro">Micro (1k)</option>
                          </select>
                        </div>

                        {/* Leverage */}
                        <div>
                          <Label htmlFor="leverage">Leverage</Label>
                          <Input
                            {...form.register('leverage')}
                            type="number"
                            placeholder="30"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <Calculator className="w-4 h-4 mr-2" />
                        Pricing & Execution
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Entry Price */}
                        <div>
                          <Label htmlFor="entryPrice">Entry Price *</Label>
                          <Input
                            {...form.register('entryPrice')}
                            type="number"
                            step="0.00001"
                            placeholder="1.05420"
                            className="mt-1"
                          />
                          {form.formState.errors.entryPrice && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.entryPrice.message}</p>
                          )}
                        </div>

                        {/* Exit Price */}
                        <div>
                          <Label htmlFor="exitPrice">Exit Price {entryMode === 'detailed' ? '(optional)' : ''}</Label>
                          <Input
                            {...form.register('exitPrice')}
                            type="number"
                            step="0.00001"
                            placeholder="1.05580"
                            className="mt-1"
                          />
                        </div>

                        {/* Spread */}
                        <div>
                          <Label htmlFor="spread">Spread (pips)</Label>
                          <Input
                            {...form.register('spread')}
                            type="number"
                            step="0.1"
                            placeholder="1.2"
                            className="mt-1"
                          />
                        </div>

                        {/* Commission */}
                        <div>
                          <Label htmlFor="commission">Commission</Label>
                          <Input
                            {...form.register('commission')}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Risk Management */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <Percent className="w-4 h-4 mr-2" />
                        Risk Management
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Stop Loss */}
                        <div>
                          <Label htmlFor="stopLoss">Stop Loss</Label>
                          <Input
                            {...form.register('stopLoss')}
                            type="number"
                            step="0.00001"
                            placeholder="1.05200"
                            className="mt-1"
                          />
                        </div>

                        {/* Take Profit */}
                        <div>
                          <Label htmlFor="takeProfit">Take Profit</Label>
                          <Input
                            {...form.register('takeProfit')}
                            type="number"
                            step="0.00001"
                            placeholder="1.05700"
                            className="mt-1"
                          />
                        </div>

                        {/* Risk Amount */}
                        <div>
                          <Label htmlFor="riskAmount">Risk Amount</Label>
                          <Input
                            {...form.register('riskAmount')}
                            type="number"
                            step="0.01"
                            placeholder="100.00"
                            className="mt-1"
                          />
                        </div>

                        {/* Swap */}
                        <div>
                          <Label htmlFor="swap">Swap/Rollover</Label>
                          <Input
                            {...form.register('swap')}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900">Timing</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date */}
                        <div>
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            {...form.register('date')}
                            type="date"
                            className="mt-1"
                          />
                          {form.formState.errors.date && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
                          )}
                        </div>

                        {/* Time In */}
                        <div>
                          <Label htmlFor="timeIn">Time In *</Label>
                          <Input
                            {...form.register('timeIn')}
                            type="time"
                            className="mt-1"
                          />
                          {form.formState.errors.timeIn && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.timeIn.message}</p>
                          )}
                        </div>

                        {/* Time Out */}
                        <div>
                          <Label htmlFor="timeOut">Time Out</Label>
                          <Input
                            {...form.register('timeOut')}
                            type="time"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analysis Section - Collapsible */}
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                        Trade Analysis & Notes
                      </button>
                      
                      {showAdvanced && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Strategy */}
                          <div>
                            <Label htmlFor="strategy">Strategy</Label>
                            <Input
                              {...form.register('strategy')}
                              placeholder="e.g., Breakout, Reversal, News Trading"
                              className="mt-1"
                            />
                          </div>

                          {/* Timeframe */}
                          <div>
                            <Label htmlFor="timeframe">Timeframe</Label>
                            <select
                              {...form.register('timeframe')}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="">Select timeframe</option>
                              <option value="1M">1 Minute</option>
                              <option value="5M">5 Minutes</option>
                              <option value="15M">15 Minutes</option>
                              <option value="30M">30 Minutes</option>
                              <option value="1H">1 Hour</option>
                              <option value="4H">4 Hours</option>
                              <option value="1D">1 Day</option>
                              <option value="1W">1 Week</option>
                            </select>
                          </div>

                          {/* Market Conditions */}
                          <div>
                            <Label htmlFor="marketConditions">Market Conditions</Label>
                            <Input
                              {...form.register('marketConditions')}
                              placeholder="e.g., Trending, Ranging, High Volatility"
                              className="mt-1"
                            />
                          </div>

                          {/* Confidence */}
                          <div>
                            <Label htmlFor="confidence">Confidence (1-10)</Label>
                            <Input
                              {...form.register('confidence')}
                              type="number"
                              min="1"
                              max="10"
                              placeholder="7"
                              className="mt-1"
                            />
                          </div>

                          {/* Emotions */}
                          <div className="md:col-span-2">
                            <Label htmlFor="emotions">Emotions</Label>
                            <Input
                              {...form.register('emotions')}
                              placeholder="e.g., Confident, Anxious, Excited, Cautious"
                              className="mt-1"
                            />
                          </div>

                          {/* Notes */}
                          <div className="md:col-span-2">
                            <Label htmlFor="notes">Trade Notes</Label>
                            <Textarea
                              {...form.register('notes')}
                              placeholder="Detailed analysis, market observations, lessons learned..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
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
