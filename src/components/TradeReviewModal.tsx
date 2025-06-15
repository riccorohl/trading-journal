import React, { useState, useEffect, useRef } from 'react';
import { useTradeContext } from '../contexts/TradeContext';
import { X, Calendar, DollarSign, TrendingUp, Brain } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  lessons?: string;
  analysis?: string;
  screenshots?: {
    [timeframe: string]: string; // Google Drive file IDs
  };
}

interface TradeReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

// Basic chart component focused on working functionality
const BasicChart: React.FC<{ trade: Trade }> = ({ trade }) => {
  const { updateTrade } = useTradeContext();
  const [timeframe, setTimeframe] = useState('1h');
  const [status, setStatus] = useState('Ready for screenshot upload');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  
  // Check if screenshot exists for current timeframe
  const hasScreenshot = trade.screenshots && trade.screenshots[timeframe];
  const screenshotUrl = hasScreenshot ? trade.screenshots[timeframe] : null; // Firebase download URL

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    
    try {
      // Import Firebase storage service
      const { uploadScreenshot } = await import('../lib/screenshotStorage');
      
      // Upload with progress tracking
      const downloadUrl = await uploadScreenshot(file, trade, timeframe, (progress) => {
        setStatus(progress.message);
      });
      
      // Update trade record with screenshot URL
      const currentScreenshots = trade.screenshots || {};
      const updatedScreenshots = {
        ...currentScreenshots,
        [timeframe]: downloadUrl
      };
      
      // Update the trade record in Firebase
      await updateTrade(trade.id, { screenshots: updatedScreenshots });
      
      setStatus('Screenshot uploaded and saved successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to extract Google Drive file ID
  const extractFileIdFromUrl = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /folders\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl(null);
  };

  // Add keyboard support for closing modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageModal]);

  return (
    <div className="w-full h-full p-4">
      {/* Timeframe buttons */}
      <div className="flex gap-2 mb-4">
        {['1m', '5m', '15m', '30m', '1h', '4h'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              timeframe === tf
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${trade.screenshots && trade.screenshots[tf] ? 'ring-2 ring-green-400' : ''}`}
          >
            {tf} {trade.screenshots && trade.screenshots[tf] ? '📸' : ''}
          </button>
        ))}
      </div>
      
      {/* Status */}
      <div className="text-center text-sm text-gray-600 mb-2">
        {trade.symbol} - {timeframe} - {status}
      </div>
      
      {/* Chart area */}
      <div className="flex justify-center">
        {screenshotUrl ? (
          // Display existing screenshot
          <div className="relative">
            <img 
              src={screenshotUrl} 
              alt={`${trade.symbol} ${timeframe} chart`}
              className="max-w-full max-h-96 rounded border shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxWidth: '700px', maxHeight: '400px' }}
              onClick={() => handleImageClick(screenshotUrl)}
              title="Click to view full size"
            />
            <button
              onClick={() => {
                // TODO: Implement screenshot replacement
                console.log('Replace screenshot for', timeframe);
              }}
              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Replace
            </button>
          </div>
        ) : (
          // Upload area
          <div 
            className={`border-2 border-dashed rounded bg-gray-50 flex items-center justify-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ width: '700px', height: '400px' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && document.getElementById('file-input')?.click()}
          >
            <div className="text-center text-gray-500">
              {uploading ? (
                <>
                  <div className="text-lg font-medium mb-2">Uploading...</div>
                  <div className="text-sm">Please wait</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium mb-2">📸 Upload Chart Screenshot</div>
                  <div className="text-sm">Drag & drop or click to upload</div>
                  <div className="text-xs mt-2 text-gray-400">
                    For {trade.symbol} - {timeframe} timeframe
                  </div>
                </>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Full-size image modal - within dialog bounds */}
      {showImageModal && modalImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeImageModal}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 1000
          }}
        >
          <div className="relative flex items-center justify-center">
            <img 
              src={modalImageUrl}
              alt="Full size chart"
              className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeImageModal();
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all z-10"
              title="Close (ESC)"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              {trade.symbol} - {timeframe} - Click anywhere outside image to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TradeReviewModal: React.FC<TradeReviewModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  // Don't render if trade is null - MUST be before any hooks
  if (!trade) {
    return null;
  }

  const [notes, setNotes] = useState(trade.notes || '');
  const [analysis, setAnalysis] = useState(trade.analysis || '');
  const [lessons, setLessons] = useState(trade.lessons || '');

  const rMultiple = trade.pnl && trade.stopLoss 
    ? Math.abs(trade.pnl / (Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity))
    : 0;

  const handleSave = () => {
    console.log('Saving trade review:', { notes, analysis, lessons });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">{trade.symbol}</span>
              <Badge variant={trade.side === 'long' ? 'default' : 'destructive'}>
                {trade.side.toUpperCase()}
              </Badge>
              <Badge variant={trade.pnl && trade.pnl >= 0 ? 'default' : 'destructive'}>
                {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'Open'}
              </Badge>
            </div>

          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 h-[80vh]">
          {/* Chart Section */}
          <div className="col-span-8">
            <Tabs defaultValue="chart" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="h-[calc(100%-3rem)] mt-4">
                <BasicChart trade={trade} />
              </TabsContent>
              
              <TabsContent value="analysis" className="h-[calc(100%-3rem)] mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Trade Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)]">
                    <Textarea
                      placeholder="What worked? What didn't? Market conditions, entry timing, exit strategy..."
                      value={analysis}
                      onChange={(e) => setAnalysis(e.target.value)}
                      className="h-full resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="h-[calc(100%-3rem)] mt-4">
                <div className="space-y-4 h-full">
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Trade Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="General notes about this trade..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Lessons Learned</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="Key takeaways for future trades..."
                        value={lessons}
                        onChange={(e) => setLessons(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="col-span-4 space-y-4 overflow-y-auto">
            {/* Trade Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trade Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Date</div>
                    <div className="font-medium">{trade.date}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Quantity</div>
                    <div className="font-medium">{trade.quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time In</div>
                    <div className="font-medium">{trade.timeIn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time Out</div>
                    <div className="font-medium">{trade.timeOut || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P&L Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  P&L Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Entry Price</div>
                    <div className="font-medium">${trade.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Exit Price</div>
                    <div className="font-medium">{trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gross P&L</div>
                    <div className={`font-medium ${trade.pnl && trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Commission</div>
                    <div className="font-medium">${trade.commission || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeReviewModal;