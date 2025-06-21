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

// Health check function for testing
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'zella-trade-scribe-functions'
  });
});