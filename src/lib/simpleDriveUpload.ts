// Simplified Google Drive Upload using HTML form
// File: src/lib/simpleDriveUpload.ts

export interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  fileId?: string;
}

// Simple Google Drive upload using file input + manual process
export const uploadScreenshotSimple = async (
  file: File,
  trade: { symbol: string; date: string; timeIn: string; id: string },
  timeframe: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> => {
  
  // Generate filename
  const filename = `${trade.symbol}_${trade.date}_${trade.timeIn.replace(':', '-')}_${timeframe}.png`;
  
  onProgress({ status: 'uploading', message: 'Preparing file for upload...' });
  
  // For now, we'll create a download link for the user to manually upload
  // This is a temporary solution until we get the Google Drive API working
  
  try {
    // Create a blob URL for the file
    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Auto-download the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    onProgress({ 
      status: 'success', 
      message: `File downloaded as ${filename}. Please upload it to your Google Drive Trading Screenshots folder manually.` 
    });
    
    // Return a placeholder file ID (user will need to provide the real one)
    return 'manual-upload-' + Date.now();
    
  } catch (error) {
    onProgress({ 
      status: 'error', 
      message: 'Failed to prepare file for download' 
    });
    throw error;
  }
};

// Alternative: Direct Google Drive web upload
export const openGoogleDriveUpload = (
  trade: { symbol: string; date: string; timeIn: string },
  timeframe: string
) => {
  const filename = `${trade.symbol}_${trade.date}_${trade.timeIn.replace(':', '-')}_${timeframe}.png`;
  
  // Open Google Drive upload page
  const driveUploadUrl = `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`;
  
  // Show instructions
  alert(`
    Please:
    1. Save your screenshot with this filename: ${filename}
    2. Upload it to your Google Drive Trading Screenshots folder
    3. Come back and enter the Google Drive file ID
  `);
  
  // Open Google Drive in new tab
  window.open(driveUploadUrl, '_blank');
};

// Helper to extract file ID from Google Drive URL
export const extractFileIdFromUrl = (url: string): string | null => {
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
