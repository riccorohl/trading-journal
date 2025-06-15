// Firebase Storage service for screenshots
// File: src/lib/screenshotStorage.ts

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { auth } from './firebase';

export interface UploadProgress {
  status: 'uploading' | 'success' | 'error';
  message: string;
  progress?: number;
  downloadUrl?: string;
}

// Upload screenshot to Firebase Storage
export const uploadScreenshot = async (
  file: File,
  trade: { symbol: string; date: string; timeIn: string; id: string },
  timeframe: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to upload screenshots');
  }

  try {
    onProgress?.({ status: 'uploading', message: 'Preparing upload...', progress: 0 });

    // Compress image before upload (optional but recommended)
    const compressedFile = await compressImage(file, 0.8); // 80% quality
    
    // Generate unique filename with path
    const filename = generateFilename(trade, timeframe);
    const filePath = `screenshots/${user.uid}/${trade.date}/${filename}`;
    
    onProgress?.({ status: 'uploading', message: 'Uploading to Firebase...', progress: 25 });

    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, compressedFile);
    
    onProgress?.({ status: 'uploading', message: 'Processing upload...', progress: 75 });

    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    onProgress?.({ 
      status: 'success', 
      message: 'Screenshot uploaded successfully!', 
      progress: 100,
      downloadUrl 
    });

    return downloadUrl;

  } catch (error) {
    console.error('Error uploading screenshot:', error);
    onProgress?.({ 
      status: 'error', 
      message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
    throw error;
  }
};

// Generate consistent filename
const generateFilename = (
  trade: { symbol: string; date: string; timeIn: string; id: string },
  timeframe: string
): string => {
  const cleanTimeIn = trade.timeIn.replace(':', '-');
  const timestamp = Date.now();
  return `${trade.symbol}_${trade.date}_${cleanTimeIn}_${timeframe}_${timestamp}.jpg`;
};

// Compress image to reduce storage costs
const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Resize if image is too large
      const maxWidth = 1200;
      const maxHeight = 800;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Delete screenshot from Firebase Storage
export const deleteScreenshot = async (downloadUrl: string): Promise<void> => {
  try {
    // Extract path from download URL
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    throw error;
  }
};

// Get storage usage for user (approximate)
export const getStorageUsage = async (): Promise<{ fileCount: number; estimatedSize: string }> => {
  const user = auth.currentUser;
  if (!user) {
    return { fileCount: 0, estimatedSize: '0 MB' };
  }

  // This is a simplified version - Firebase doesn't provide direct storage usage API
  // You could implement a counter in Firestore to track this
  
  return { fileCount: 0, estimatedSize: 'Unknown' };
};

// Storage limits and costs info
export const getStorageInfo = () => ({
  freeLimit: '1 GB',
  costPerGB: '$0.026/month',
  estimatedCostPer100Screenshots: '~$2-5/month',
  compressionSavings: '60-80% size reduction'
});
