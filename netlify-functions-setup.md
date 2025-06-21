# Netlify Functions Alternative

If you want to deploy on Netlify instead of Firebase:

## Create `netlify/functions/economic-calendar.js`:

```javascript
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { start, end, filter = '2-3_USD', calPeriod = '10' } = event.queryStringParameters || {};
    
    const myfxbookUrl = `http://www.myfxbook.com/calendar_statement.xml`;
    const params = new URLSearchParams({ start, end, filter, calPeriod });
    
    const response = await axios.get(`${myfxbookUrl}?${params.toString()}`);
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/xml' },
      body: response.data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch economic calendar data' }),
    };
  }
};
```

## Update your service to use:
```typescript
const NETLIFY_FUNCTION_URL = '/.netlify/functions/economic-calendar';
```

## Pros:
✅ Good alternative to Firebase
✅ Free tier available
✅ Easy deployment

## Cons:
❌ Requires switching from Firebase hosting
❌ Different ecosystem
