# Complete Firebase Setup Guide for Zella Trade Scribe

## Step 1: Initialize Firebase in Your Project

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project root
firebase init

# Select these services:
# ✅ Firestore (already configured)
# ✅ Functions (NEW - for economic calendar proxy)
# ✅ Hosting (NEW - to deploy your app)
# ✅ Storage (already configured)

# When prompted:
# - Use existing project: tradejournal-b5c65
# - Functions language: TypeScript
# - Install dependencies: Yes
# - Public directory: dist (this is important for Vite!)
# - Single-page app: Yes
# - GitHub auto-deployment: No (for now)
```

## Step 2: Configure Firebase Hosting for Vite

Firebase will create `firebase.json`. Update it to:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ]
    }
  ],
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|jsx|ts|tsx|css|html|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Step 3: Create the Economic Calendar Cloud Function

Navigate to `functions/src/index.ts` and replace content with:

```typescript
import * as functions from 'firebase-functions';
import * as cors from 'cors';
import axios from 'axios';

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
      
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      
      // Determine error type and provide appropriate response
      if (error.code === 'ECONNABORTED') {
        res.status(408).json({ 
          error: 'Request timeout - MyFXBook service is slow to respond',
          details: 'Please try again in a moment'
        });
      } else if (error.response) {
        res.status(error.response.status).json({ 
          error: 'MyFXBook service error',
          details: error.response.statusText 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to fetch economic calendar data',
          details: error.message 
        });
      }
    }
  });
});

// Health check function
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'zella-trade-scribe-functions'
  });
});
```

## Step 4: Install Function Dependencies

```bash
cd functions
npm install cors axios
npm install --save-dev @types/cors
cd ..
```

## Step 5: Update Your Economic Calendar Service

Update `src/lib/economicCalendarService.ts`:

```typescript
// Replace the fetchEconomicEvents function with:

export const fetchEconomicEvents = async (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD']
): Promise<EconomicEvent[]> => {
  try {
    // Use Firebase Function URL (will be auto-detected when deployed)
    const isDevelopment = import.meta.env.DEV;
    const functionUrl = isDevelopment 
      ? 'http://localhost:5001/tradejournal-b5c65/us-central1/economicCalendarProxy'
      : 'https://us-central1-tradejournal-b5c65.cloudfunctions.net/economicCalendarProxy';
    
    const params = new URLSearchParams({
      start: `${startDate} 00:00`,
      end: `${endDate} 23:59`,
      filter: `2-3_${currencies.join('-')}`,
      calPeriod: '10'
    });
    
    console.log('Fetching from Firebase Function:', `${functionUrl}?${params.toString()}`);
    
    const response = await fetch(`${functionUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const events = parseMyFXBookXML(xmlText);
    
    // If no events found, log for debugging
    if (events.length === 0) {
      console.log('No events parsed from XML. Raw XML:', xmlText.substring(0, 500));
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching from Firebase Function:', error);
    
    // Return sample data for development
    console.log('Falling back to sample data');
    return getSampleEconomicEvents();
  }
};
```

## Step 6: Build and Deploy

```bash
# Build your React app
npm run build

# Deploy everything to Firebase
firebase deploy

# Or deploy specific services:
firebase deploy --only functions  # Deploy functions first
firebase deploy --only hosting    # Then deploy hosting
```

## Step 7: Test Locally (Optional)

```bash
# Serve functions locally
firebase emulators:start --only functions

# In another terminal, serve your app
npm run dev

# Your function will be available at:
# http://localhost:5001/tradejournal-b5c65/us-central1/economicCalendarProxy
```

## Step 8: Your Live URLs

After deployment:
- **App**: https://tradejournal-b5c65.web.app
- **Function**: https://us-central1-tradejournal-b5c65.cloudfunctions.net/economicCalendarProxy
- **Custom Domain** (optional): You can set up a custom domain in Firebase Console

## Important Notes:

1. **Build Directory**: Make sure `firebase.json` points to `dist` (Vite's output)
2. **SPA Routing**: The rewrite rule ensures React Router works
3. **Caching**: Static assets are cached for 1 year for performance
4. **CORS**: Function handles CORS automatically
5. **Error Handling**: Graceful fallback to sample data if API fails

## Troubleshooting:

- If function fails, check Firebase Console > Functions > Logs
- If hosting fails, ensure `npm run build` creates `dist` folder
- If routes don't work, verify the rewrite rule in `firebase.json`
