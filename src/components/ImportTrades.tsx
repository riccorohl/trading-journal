import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';

interface ImportTradesProps {
  onClose: () => void;
}

interface CSVRow {
  [key: string]: string;
}

const QUANTOWER_COLUMNS = [
  'Account', 'Symbol', 'Side', 'Order type', 'Quantity', 'Price', 
  'Trigger price', 'TIF', 'Status', 'Order ID', 'Connection name', 
  'Original status', 'Comment', 'Average fill price'
];

const ImportTrades: React.FC<ImportTradesProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTrade } = useTradeContext();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFileName(file.name);
    setError('');

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
        // Create a new FileList-like object
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
        handleFileUpload({ target: { files: dt.files } } as any);
      }
    }
  };

  const handleImport = () => {
    setStep('importing');
    
    // Simulate import process for now
    setTimeout(() => {
      setStep('complete');
    }, 2000);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Quantower Trades</h3>
        <p className="text-gray-600">Upload your CSV file from Quantower to import trades</p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Drop your CSV file here</p>
        <p className="text-gray-600 mb-4">or click to browse</p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Select File
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
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
  );

  const renderPreviewStep = () => (
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

  const renderImportingStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
        <Upload className="w-8 h-8 text-purple-600 animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Importing Trades...</h3>
        <p className="text-gray-600">Processing your CSV file and creating trade records</p>
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
        <p className="text-gray-600">Your trades have been successfully imported</p>
      </div>
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
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
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
