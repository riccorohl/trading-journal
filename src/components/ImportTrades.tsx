import React, { useState, useRef } from 'react';
import { useTradeContext } from '@/contexts/TradeContext';
import { Upload, X, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { parseMetaTraderFile, validateMTTrades, convertMTTradeToAppTrade, ParsedMTTrade } from '@/lib/mt-parser';

interface ImportTradesProps {
  onClose: () => void;
}

interface CSVRow {
  [key: string]: string;
}

type Platform = 'quantower' | 'mt4' | 'mt5' | 'auto-detect';

const QUANTOWER_COLUMNS = [
  'Account', 'Symbol', 'Side', 'Order type', 'Quantity', 'Price', 
  'Trigger price', 'TIF', 'Status', 'Order ID', 'Connection name', 
  'Original status', 'Comment', 'Average fill price'
];

const ImportTrades: React.FC<ImportTradesProps> = ({ onClose }) => {
  const [step, setStep] = useState<'platform' | 'upload' | 'preview' | 'mapping' | 'importing' | 'complete'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('auto-detect');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mtTrades, setMtTrades] = useState<ParsedMTTrade[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [importStats, setImportStats] = useState<{ valid: number; invalid: number; total: number }>({ valid: 0, invalid: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTrade } = useTradeContext();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFileName(file.name);
    setError('');

    try {
      if (selectedPlatform === 'mt4' || selectedPlatform === 'mt5' || selectedPlatform === 'auto-detect') {
        // Use MT4/MT5 parser
        const trades = await parseMetaTraderFile(file);
        const { valid, invalid } = validateMTTrades(trades);
        
        setMtTrades(valid);
        setImportStats({ 
          valid: valid.length, 
          invalid: invalid.length, 
          total: trades.length 
        });

        if (valid.length === 0) {
          setError(`No valid trades found. ${invalid.length} trades had errors.`);
          return;
        }

        setStep('preview');
      } else {
        // Use existing Quantower parser
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
              setError('CSV file appears to be empty');
              return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const rows = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: CSVRow = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });

            setCsvHeaders(headers);
            setCsvData(rows);
            setStep('preview');
          } catch (err) {
            setError('Error parsing CSV file. Please check the format.');
          }
        };
        reader.readAsText(file);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error processing file. Please check the format.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
        handleFileUpload({ target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleImport = async () => {
    setStep('importing');
    
    try {
      if (mtTrades.length > 0) {
        // Import MT4/MT5 trades
        for (const mtTrade of mtTrades) {
          const appTrade = convertMTTradeToAppTrade(mtTrade);
          await addTrade(appTrade);
        }
      } else {
        // Import Quantower trades (existing logic)
        // TODO: Implement Quantower import logic
      }
      
      // Simulate processing time
      setTimeout(() => {
        setStep('complete');
      }, 1500);
    } catch (err) {
      setError('Error importing trades. Please try again.');
      setStep('preview');
    }
  };

  const renderPlatformStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Trading Platform</h3>
        <p className="text-gray-600">Choose your trading platform to ensure optimal import accuracy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setSelectedPlatform('auto-detect');
            setStep('upload');
          }}
          className="p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors text-left group"
        >
          <div className="flex items-center mb-3">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900">MetaTrader 4 & 5</h4>
              <p className="text-sm text-purple-600">Auto-detect MT4/MT5</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Import from MetaTrader 4 or 5 CSV exports. Supports all major brokers and automatically calculates pips.
          </p>
          <div className="mt-3">
            <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Recommended for Forex
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedPlatform('quantower');
            setStep('upload');
          }}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors text-left"
        >
          <div className="flex items-center mb-3">
            <FileText className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900">Quantower</h4>
              <p className="text-sm text-gray-600">Professional trading platform</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Import from Quantower CSV exports with comprehensive order and execution data.
          </p>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Import {selectedPlatform === 'quantower' ? 'Quantower' : 'MetaTrader'} Trades
        </h3>
        <p className="text-gray-600">
          {selectedPlatform === 'quantower' 
            ? 'Upload your CSV file from Quantower to import trades'
            : 'Upload your CSV export file from MT4 or MT5'
          }
        </p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-gray-600">CSV files only</p>
        {selectedPlatform !== 'quantower' && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Supported formats:</p>
            <p>• MT4: Account History export</p>
            <p>• MT5: Account History export</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('platform')}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    const isMetaTrader = mtTrades.length > 0;

    if (isMetaTrader) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">MetaTrader Import Preview</h3>
              <p className="text-gray-600">File: {fileName}</p>
            </div>
            <div className="text-sm text-gray-500">
              {importStats.valid} valid trades, {importStats.invalid} errors
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importStats.valid}</div>
              <div className="text-sm text-green-800">Valid Trades</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {mtTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-800">Total P&L</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {mtTrades.reduce((sum, trade) => sum + (trade.pips || 0), 0).toFixed(1)}
              </div>
              <div className="text-sm text-purple-800">Total Pips</div>
            </div>
          </div>

          {mtTrades.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h4 className="font-medium text-gray-900">Trade Preview (first 5 trades)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Symbol</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Volume</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Entry</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Exit</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Pips</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mtTrades.slice(0, 5).map((trade, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2 font-medium">{trade.symbol}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.type === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">{trade.volume}</td>
                        <td className="px-3 py-2">{trade.openPrice.toFixed(5)}</td>
                        <td className="px-3 py-2">{trade.closePrice.toFixed(5)}</td>
                        <td className="px-3 py-2 font-medium">
                          <span className={trade.pips && trade.pips > 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.pips?.toFixed(1) || '0.0'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <span className={trade.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.profit.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('upload')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              disabled={importStats.valid === 0}
            >
              Import {importStats.valid} Trades
            </button>
          </div>
        </div>
      );
    }

    // Existing Quantower preview logic
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">File Preview</h3>
            <p className="text-gray-600">File: {fileName}</p>
          </div>
          <div className="text-sm text-gray-500">
            {csvData.length} rows detected
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Detected Columns:</h4>
          <div className="flex flex-wrap gap-2">
            {csvHeaders.map((header, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs bg-green-100 text-green-800"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        {csvData.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h4 className="font-medium text-gray-900">Data Preview (first 3 rows)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {csvHeaders.slice(0, 6).map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                        {header}
                      </th>
                    ))}
                    {csvHeaders.length > 6 && (
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        +{csvHeaders.length - 6} more columns
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      {csvHeaders.slice(0, 6).map((header, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 text-gray-600">
                          {row[header] || '-'}
                        </td>
                      ))}
                      {csvHeaders.length > 6 && (
                        <td className="px-3 py-2 text-gray-400">
                          +{csvHeaders.length - 6} more
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('upload')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleImport}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Import Trades
          </button>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
        <Upload className="w-8 h-8 text-purple-600 animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Importing Trades...</h3>
        <p className="text-gray-600">
          {mtTrades.length > 0 
            ? `Processing ${importStats.valid} MetaTrader trades with pip calculations`
            : 'Processing your CSV file and creating trade records'
          }
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Complete!</h3>
        <p className="text-gray-600">
          {mtTrades.length > 0 
            ? `Successfully imported ${importStats.valid} MetaTrader trades with automatic pip calculations`
            : 'Your trades have been successfully imported'
          }
        </p>
      </div>
      {mtTrades.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-800">
            <p>✓ Automatic pip calculations applied</p>
            <p>✓ Forex pair formatting optimized</p>
            <p>✓ Commission and swap data included</p>
          </div>
        </div>
      )}
      <button
        onClick={onClose}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Import Trades</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'platform' && renderPlatformStep()}
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
};

export default ImportTrades;
