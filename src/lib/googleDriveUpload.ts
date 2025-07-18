// Google Drive Screenshot Upload Service
// File: src/lib/googleDriveUpload.ts

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: Record<string, unknown>) => Promise<void>;
        drive: Record<string, unknown>;
      };
    };
  }
}

// Initialize Google Drive API
export const initializeGoogleDrive = async () => {
  // This uses the existing Google auth from your Firebase setup
  // The user is already authenticated via Google OAuth
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: 'your-api-key', // We'll use your existing Firebase config
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      reject(new Error('Google API not loaded'));
    }
  });
};

// Upload screenshot to Google Drive
export const uploadScreenshotToDrive = async (
  file: File, 
  trade: { symbol: string; date: string; timeIn: string; id: string }, 
  timeframe: string
): Promise<string> => {
  try {
    // Generate consistent filename
    const filename = `${trade.symbol}_${trade.date}_${trade.timeIn.replace(':', '-')}_${timeframe}.png`;
    
    // Create form data for upload
    const metadata = {
      name: filename,
      parents: ['1ABC123DEF456'], // Replace with your screenshots folder ID
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);
    
    // Get auth token (from your existing Google auth)
    const authToken = await getGoogleAuthToken();
    
    // Upload to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: form,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.id; // Google Drive file ID
    
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

// Get Google auth token from Firebase Auth
const getGoogleAuthToken = async (): Promise<string> => {
  const { onAuthStateChanged } = await import('firebase/auth');
  const { auth } = await import('./firebase');
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        try {
          // Get the ID token which includes Google access permissions
          const idToken = await user.getIdToken();
          
          // For Google Drive API, we need to get the access token
          // This requires additional scope configuration
          const accessToken = await getAccessTokenFromIdToken(idToken);
          resolve(accessToken);
        } catch (error) {
          reject(new Error('Failed to get Google access token'));
        }
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
};

// Helper to get access token (simplified approach)
const getAccessTokenFromIdToken = async (idToken: string): Promise<string> => {
  // For now, we'll use a different approach since getting the access token 
  // from Firebase Auth requires additional setup
  
  // Alternative: Use Google Drive API with your existing Google auth
  // This might require additional configuration in your Google Cloud Console
  
  throw new Error('Google Drive access token not yet configured');
};

// Generate Google Drive viewing URL
export const getGoogleDriveImageUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?id=${fileId}&export=view`;
};

// Check if file exists in Google Drive
export const checkFileExists = async (fileId: string): Promise<boolean> => {
  try {
    const authToken = await getGoogleAuthToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};
