import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { X, Calendar, DollarSign, TrendingUp, Brain, FileText } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';

interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  date: string;
  timeIn: string;
  timeOut?: string;
  pnl?: number;
  commission?: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
  notes?: string;
  analysis?: string;
  lessons?: string;
  screenshots?: { [timeframe: string]: string };
}

interface TradeReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

// BasicChart component for screenshot management
const BasicChart: React.FC<{ trade: Trade }> = ({ trade }) => {
  const [timeframe, setTimeframe] = useState('1h');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('Ready for screenshot upload');
  const [dragOver, setDragOver] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  
  // Local state for screenshots to enable real-time updates
  const [localScreenshots, setLocalScreenshots] = useState<{ [timeframe: string]: string } | null>(
    trade.screenshots || null
  );
  
  const { updateTrade } = useTradeContext();
  
  // Update local screenshots when trade prop changes
  useEffect(() => {
    setLocalScreenshots(trade.screenshots || null);
  }, [trade.screenshots]);
  
  // Check if screenshot exists for current timeframe using local state
  const hasScreenshot = localScreenshots && localScreenshots[timeframe];
  const screenshotUrl = hasScreenshot ? localScreenshots[timeframe] : null; // Firebase download URL

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
      const updatedScreenshots = { ...currentScreenshots, [timeframe]: downloadUrl };
      
      await updateTrade(trade.id, { screenshots: updatedScreenshots });
      
      // Update local state immediately for real-time UI update
      setLocalScreenshots(updatedScreenshots);
      
      setStatus('Screenshot uploaded and saved successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceScreenshot = () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleDeleteScreenshot = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${timeframe} screenshot for ${trade.symbol}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setUploading(true);
    setStatus('Deleting screenshot...');

    try {
      // Import Firebase storage service
      const { deleteScreenshot } = await import('../lib/screenshotStorage');
      
      // Delete from Firebase Storage
      if (screenshotUrl) {
        await deleteScreenshot(screenshotUrl);
      }
      
      // Update trade record to remove screenshot URL
      const currentScreenshots = trade.screenshots || {};
      const updatedScreenshots = { ...currentScreenshots };
      delete updatedScreenshots[timeframe];
      
      await updateTrade(trade.id, { 
        screenshots: Object.keys(updatedScreenshots).length > 0 ? updatedScreenshots : null 
      });
      
      // Update local state immediately for real-time UI update
      const finalScreenshots = Object.keys(updatedScreenshots).length > 0 ? updatedScreenshots : null;
      setLocalScreenshots(finalScreenshots);
      
      setStatus('Screenshot deleted successfully');
      setTimeout(() => setStatus('Ready for screenshot upload'), 2000);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setStatus('Delete failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (uploading) return;
    
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

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl(null);
  };

  // Handle ESC key for image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal]);

  return (
    <div className="h-full flex flex-col">
      {/* Timeframe buttons */}
      <div className="flex gap-2 mb-4">
        {['1m', '5m', '15m', '30m', '1h', '4h'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeframe === tf 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${localScreenshots?.[tf] ? 'ring-2 ring-green-400' : ''}`}
            title={localScreenshots?.[tf] ? 'Screenshot available' : 'No screenshot'}
          >
            {tf}
            {localScreenshots?.[tf] && <span className="ml-1">📸</span>}
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
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={handleReplaceScreenshot}
                disabled={uploading}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Replace screenshot"
              >
                Replace
              </button>
              <button
                onClick={handleDeleteScreenshot}
                disabled={uploading}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete screenshot"
              >
                Delete
              </button>
            </div>
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
                  <div className="text-6xl mb-4">📸</div>
                  <div className="text-lg font-medium mb-2">Upload Chart Screenshot</div>
                  <div className="text-sm">Drag & drop or click to upload</div>
                  <div className="text-xs text-gray-400 mt-1">For {trade.symbol} - {timeframe} timeframe</div>
                </>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {showImageModal && modalImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img 
              src={modalImageUrl} 
              alt="Full size chart"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const rMultiple = trade.pnl && trade.stopLoss 
    ? Math.abs(trade.pnl / (Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity))
    : 0;

  const handleSave = () => {
    console.log('Saving trade review:', { notes, analysis, lessons });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden [&>button]:hidden">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
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
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes & Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)]">
                    <Textarea
                      placeholder="Key takeaways, lessons learned, areas for improvement..."
                      value={lessons}
                      onChange={(e) => setLessons(e.target.value)}
                      className="h-full resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Trade Details Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Trade Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trade Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Date</div>
                    <div className="font-medium">{trade.date}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Quantity</div>
                    <div className="font-medium">{trade.quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Time In</div>
                    <div className="font-medium">{trade.timeIn}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Time Out</div>
                    <div className="font-medium">{trade.timeOut || 'Open'}</div>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Entry Price</div>
                    <div className="font-medium">${trade.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Exit Price</div>
                    <div className="font-medium">${trade.exitPrice || 'Open'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Gross P&L</div>
                    <div className={`font-medium ${trade.pnl && trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'Open'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Commission</div>
                    <div className="font-medium">${trade.commission || 0}</div>
                  </div>
                </div>
                
                {rMultiple > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-gray-500 text-sm">R-Multiple</div>
                    <div className="font-medium text-lg">{rMultiple.toFixed(2)}R</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              className="w-full"
              size="lg"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeReviewModal;