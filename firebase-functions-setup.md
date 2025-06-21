# Firebase Cloud Functions CORS Proxy Setup

## Step 1: Initialize Firebase Functions

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions in your project
firebase init functions

# Choose:
# - Use existing project (your current Firebase project)
# - JavaScript or TypeScript (I recommend TypeScript)
# - Install dependencies now
```

## Step 2: Create the CORS Proxy Function

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as cors from 'cors';
import axios from 'axios';

const corsHandler = cors({ origin: true });

export const economicCalendarProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Extract query parameters from the request
      const { start, end, filter, calPeriod } = req.query;
      
      // Construct MyFXBook URL
      const myfxbookUrl = `http://www.myfxbook.com/calendar_statement.xml`;
      const params = new URLSearchParams({
        start: start as string || '',
        end: end as string || '',
        filter: filter as string || '2-3_USD',
        calPeriod: calPeriod as string || '10'
      });
      
      // Fetch data from MyFXBook
      const response = await axios.get(`${myfxbookUrl}?${params.toString()}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Return the XML data with proper headers
      res.set('Content-Type', 'application/xml');
      res.status(200).send(response.data);
      
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      res.status(500).json({ 
        error: 'Failed to fetch economic calendar data',
        details: error.message 
      });
    }
  });
});
```

## Step 3: Install Dependencies

```bash
cd functions
npm install cors axios
npm install --save-dev @types/cors
```

## Step 4: Deploy the Function

```bash
# Deploy only functions
firebase deploy --only functions

# Your function will be available at:
# https://your-region-your-project-id.cloudfunctions.net/economicCalendarProxy
```

## Step 5: Update Your Service

Update `src/lib/economicCalendarService.ts`:

```typescript
// Replace the direct MyFXBook URL with your Cloud Function
const FIREBASE_FUNCTION_URL = 'https://your-region-your-project-id.cloudfunctions.net/economicCalendarProxy';

export const fetchEconomicEvents = async (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD']
): Promise<EconomicEvent[]> => {
  try {
    const params = new URLSearchParams({
      start: `${startDate} 00:00`,
      end: `${endDate} 23:59`,
      filter: `2-3_${currencies.join('-')}`,
      calPeriod: '10'
    });
    
    const response = await fetch(`${FIREBASE_FUNCTION_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return parseMyFXBookXML(xmlText);
  } catch (error) {
    console.error('Error fetching from Firebase Function:', error);
    return getSampleEconomicEvents();
  }
};
```

## Pros:
✅ Integrated with Firebase ecosystem
✅ Automatic scaling
✅ Built-in security
✅ Free tier available (125,000 invocations/month)
✅ Works perfectly with Firebase hosting

## Cons:
❌ Requires Firebase Functions setup
❌ Cold start latency (1-2 seconds for first request)
