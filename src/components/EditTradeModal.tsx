import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Trade {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  commission?: number;
  strategy?: string;
  notes?: string;
  confidence?: number;
  emotions?: string;
  marketConditions?: string;
}

interface EditTradeModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditTradeModal: React.FC<EditTradeModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  const { updateTrade } = useTradeContext();
  const [formData, setFormData] = useState<Partial<Trade>>({});

  useEffect(() => {
    if (trade) {
      setFormData({ ...trade });
    }
  }, [trade]);

  if (!trade) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    try {
      const updatedTrade = {
        ...trade,
        ...formData,
        entryPrice: Number(formData.entryPrice),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        quantity: Number(formData.quantity),
        stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
        takeProfit: formData.takeProfit ? Number(formData.takeProfit) : undefined,
        commission: formData.commission ? Number(formData.commission) : undefined,
        confidence: formData.confidence ? Number(formData.confidence) : undefined,
      };

      // Remove undefined values for Firebase
      const cleanedTrade = Object.fromEntries(
        Object.entries(updatedTrade).filter(([_, value]) => value !== undefined)
      );

      // Calculate P&L if both prices exist
      if (cleanedTrade.entryPrice && cleanedTrade.exitPrice && cleanedTrade.quantity) {
        const priceChange = cleanedTrade.side === 'long' 
          ? cleanedTrade.exitPrice - cleanedTrade.entryPrice
          : cleanedTrade.entryPrice - cleanedTrade.exitPrice;
        cleanedTrade.pnl = priceChange * cleanedTrade.quantity - (cleanedTrade.commission || 0);
      }

      console.log('Updating trade with:', cleanedTrade);
      await updateTrade(cleanedTrade.id, cleanedTrade);
      console.log('Trade updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update trade:', error);
      alert('Failed to update trade: ' + error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Trade: {trade.symbol}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol || ''}
                onChange={(e) => handleChange('symbol', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="side">Side</Label>
              <Select value={formData.side} onValueChange={(value) => handleChange('side', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="timeIn">Time In</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn || ''}
                onChange={(e) => handleChange('timeIn', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="timeOut">Time Out</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut || ''}
                onChange={(e) => handleChange('timeOut', e.target.value)}
              />
            </div>
          </div>

          {/* Prices and Quantity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice || ''}
                onChange={(e) => handleChange('entryPrice', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={formData.exitPrice || ''}
                onChange={(e) => handleChange('exitPrice', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Risk Management */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.01"
                value={formData.stopLoss || ''}
                onChange={(e) => handleChange('stopLoss', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                step="0.01"
                value={formData.takeProfit || ''}
                onChange={(e) => handleChange('takeProfit', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="commission">Commission</Label>
              <Input
                id="commission"
                type="number"
                step="0.01"
                value={formData.commission || ''}
                onChange={(e) => handleChange('commission', e.target.value)}
              />
            </div>
          </div>

          {/* Strategy and Notes */}
          <div>
            <Label htmlFor="strategy">Strategy</Label>
            <Input
              id="strategy"
              value={formData.strategy || ''}
              onChange={(e) => handleChange('strategy', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Psychology */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence">Confidence (1-10)</Label>
              <Input
                id="confidence"
                type="number"
                min="1"
                max="10"
                value={formData.confidence || ''}
                onChange={(e) => handleChange('confidence', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="emotions">Emotions</Label>
              <Input
                id="emotions"
                value={formData.emotions || ''}
                onChange={(e) => handleChange('emotions', e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTradeModal;