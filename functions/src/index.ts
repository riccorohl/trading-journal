import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import axios from 'axios';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const corsHandler = cors({ origin: true });

export const economicCalendarProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Log the request for debugging
      console.log('Economic calendar request:', req.query);
      
      // Extract query parameters
      const { start, end, filter = '2-3_USD', calPeriod = '10' } = req.query;
      
      // Validate required parameters
      if (!start || !end) {
        res.status(400).json({ 
          error: 'Missing required parameters: start and end dates' 
        });
        return;
      }
      
      // Construct MyFXBook URL
      const myfxbookUrl = 'http://www.myfxbook.com/calendar_statement.xml';
      const params = new URLSearchParams({
        start: start as string,
        end: end as string,
        filter: filter as string,
        calPeriod: calPeriod as string
      });
      
      console.log('Fetching from MyFXBook:', `${myfxbookUrl}?${params.toString()}`);
      
      // Fetch data from MyFXBook with timeout and proper headers
      const response = await axios.get(`${myfxbookUrl}?${params.toString()}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      console.log('MyFXBook response status:', response.status);
      
      // Return the XML data with proper headers
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      });
      res.status(200).send(response.data);
      
    } catch (error: unknown) {
      console.error('Error fetching economic calendar:', error);
      
      // Determine error type and provide appropriate response
      if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
        res.status(408).json({ 
          error: 'Request timeout - MyFXBook service is slow to respond',
          details: 'Please try again in a moment'
        });
      } else if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { status?: number; statusText?: string } }).response;
        res.status(response?.status || 500).json({ 
          error: 'MyFXBook service error',
          details: response?.statusText || 'Service error'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to fetch economic calendar data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
});

// EA Integration Functions

// Interface for EA trade data
interface EATradeData {
  accountNumber: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice?: number;
  openTime: string;
  closeTime?: string;
  profit?: number;
  swap?: number;
  commission?: number;
  comment?: string;
  positionId: string;
  isOpen: boolean;
  magicNumber?: number;
  stopLoss?: number;
  takeProfit?: number;
}

// Authentication function for EA requests
const authenticateEA = (apiKey: string, userToken?: string): { isValid: boolean; userId?: string; error?: string } => {
  // Basic API key validation
  if (!apiKey || apiKey.length < 20) {
    return { isValid: false, error: 'Invalid API key format' };
  }

  // Extract user ID from API key format: "ea_[userId]_[timestamp]_[hash]"
  const parts = apiKey.split('_');
  if (parts.length !== 4 || parts[0] !== 'ea') {
    return { isValid: false, error: 'Invalid API key structure' };
  }

  const userId = parts[1];
  if (!userId || userId.length < 10) {
    return { isValid: false, error: 'Invalid user ID in API key' };
  }

  return { isValid: true, userId };
};

// Convert EA trade data to journal format
const convertEAToJournalTrade = (eaTrade: EATradeData, userId: string) => {
  const now = admin.firestore.Timestamp.now();
  
  return {
    id: `ea_${eaTrade.positionId}_${Date.now()}`,
    userId,
    symbol: eaTrade.symbol,
    side: eaTrade.type === 'buy' ? 'long' : 'short',
    entryPrice: eaTrade.openPrice,
    exitPrice: eaTrade.closePrice || 0,
    quantity: eaTrade.volume,
    date: eaTrade.openTime.split(' ')[0], // Extract date from datetime
    timeIn: eaTrade.openTime.split(' ')[1] || '00:00:00',
    timeOut: eaTrade.closeTime?.split(' ')[1] || '',
    pnl: eaTrade.profit || 0,
    commission: eaTrade.commission || 0,
    swap: eaTrade.swap || 0,
    result: eaTrade.profit && eaTrade.profit > 0 ? 'WIN' : eaTrade.profit && eaTrade.profit < 0 ? 'LOSS' : 'PENDING',
    status: eaTrade.isOpen ? 'open' : 'closed',
    notes: eaTrade.comment || `EA Trade - Magic: ${eaTrade.magicNumber || 'N/A'}`,
    platform: 'MetaTrader',
    source: 'EA',
    stopLoss: eaTrade.stopLoss || 0,
    takeProfit: eaTrade.takeProfit || 0,
    accountNumber: eaTrade.accountNumber,
    positionId: eaTrade.positionId,
    magicNumber: eaTrade.magicNumber || 0,
    createdAt: now,
    updatedAt: now
  };
};

// Main EA endpoint to receive trade data
export const receiveEATrade = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
      }

      // Validate request headers
      const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'] as string;
      if (!apiKey) {
        res.status(401).json({ error: 'Missing API key. Include in Authorization header or x-api-key.' });
        return;
      }

      // Authenticate the EA
      const auth = authenticateEA(apiKey);
      if (!auth.isValid) {
        res.status(401).json({ error: auth.error });
        return;
      }

      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Invalid request body. Expected JSON object.' });
        return;
      }

      const eaTrade: EATradeData = req.body;

      // Validate required fields
      const requiredFields = ['accountNumber', 'symbol', 'type', 'volume', 'openPrice', 'openTime', 'positionId'];
      const missingFields = requiredFields.filter(field => !eaTrade[field]);
      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: 'Missing required fields', 
          missingFields 
        });
        return;
      }

      // Convert EA trade to journal format
      const journalTrade = convertEAToJournalTrade(eaTrade, auth.userId!);

      // Check if trade already exists (prevent duplicates)
      const existingTradeQuery = await db.collection('trades')
        .where('userId', '==', auth.userId)
        .where('positionId', '==', eaTrade.positionId)
        .where('accountNumber', '==', eaTrade.accountNumber)
        .limit(1)
        .get();

      if (!existingTradeQuery.empty) {
        // Update existing trade if it's a close or modification
        const existingTradeDoc = existingTradeQuery.docs[0];
        const existingTrade = existingTradeDoc.data();
        
        if (!eaTrade.isOpen && existingTrade.status === 'open') {
          // Trade is being closed
          await existingTradeDoc.ref.update({
            exitPrice: eaTrade.closePrice,
            timeOut: eaTrade.closeTime?.split(' ')[1] || '',
            pnl: eaTrade.profit || 0,
            commission: eaTrade.commission || 0,
            swap: eaTrade.swap || 0,
            result: eaTrade.profit && eaTrade.profit > 0 ? 'WIN' : 'LOSS',
            status: 'closed',
            updatedAt: admin.firestore.Timestamp.now()
          });

          res.status(200).json({ 
            success: true, 
            message: 'Trade updated successfully',
            tradeId: existingTradeDoc.id,
            action: 'updated'
          });
          return;
        } else {
          res.status(200).json({ 
            success: true, 
            message: 'Trade already exists',
            tradeId: existingTradeDoc.id,
            action: 'duplicate'
          });
          return;
        }
      }

      // Add new trade to Firestore
      const tradeRef = await db.collection('trades').add(journalTrade);

      console.log(`EA Trade received and stored: ${tradeRef.id}`, {
        userId: auth.userId,
        symbol: eaTrade.symbol,
        type: eaTrade.type,
        volume: eaTrade.volume,
        positionId: eaTrade.positionId
      });

      res.status(201).json({ 
        success: true, 
        message: 'Trade received and stored successfully',
        tradeId: tradeRef.id,
        action: 'created'
      });

    } catch (error) {
      console.error('Error processing EA trade:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Generate API key for EA authentication
export const generateEAApiKey = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const timestamp = Date.now();
    
    // Create a hash for additional security (simplified for demo)
    const hash = Buffer.from(`${userId}_${timestamp}_trading_journal`).toString('base64').slice(0, 16);
    
    // Generate API key: ea_[userId]_[timestamp]_[hash]
    const apiKey = `ea_${userId}_${timestamp}_${hash}`;

    // Store the API key in user's profile
    await db.collection('userProfiles').doc(userId).update({
      eaApiKey: apiKey,
      eaApiKeyGenerated: admin.firestore.Timestamp.now(),
      eaEnabled: true
    });

    return { 
      success: true, 
      apiKey,
      message: 'EA API key generated successfully'
    };

  } catch (error) {
    console.error('Error generating EA API key:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate API key');
  }
});

// Health check function for testing
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'zella-trade-scribe-functions'
  });
});