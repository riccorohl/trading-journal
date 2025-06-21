# Third-Party CORS Proxy Solutions

## Option A: AllOrigins (Free)

```typescript
// Update economicCalendarService.ts
const PROXY_URL = 'https://api.allorigins.win/get?url=';

export const fetchEconomicEvents = async (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD']
): Promise<EconomicEvent[]> => {
  try {
    const myfxbookUrl = generateMyFXBookURL(startDate, endDate, currencies);
    const proxiedUrl = `${PROXY_URL}${encodeURIComponent(myfxbookUrl)}`;
    
    const response = await fetch(proxiedUrl);
    const data = await response.json();
    
    return parseMyFXBookXML(data.contents);
  } catch (error) {
    console.error('Error fetching via AllOrigins:', error);
    return getSampleEconomicEvents();
  }
};
```

## Option B: CORS Anywhere (Free with limits)

```typescript
// Update economicCalendarService.ts
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export const fetchEconomicEvents = async (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD']
): Promise<EconomicEvent[]> => {
  try {
    const myfxbookUrl = generateMyFXBookURL(startDate, endDate, currencies);
    const proxiedUrl = `${CORS_PROXY}${myfxbookUrl}`;
    
    const response = await fetch(proxiedUrl);
    const xmlText = await response.text();
    
    return parseMyFXBookXML(xmlText);
  } catch (error) {
    console.error('Error fetching via CORS Anywhere:', error);
    return getSampleEconomicEvents();
  }
};
```

## Option C: QuotaGuard (Professional)

For production apps, consider QuotaGuard or similar professional proxy services.

## Pros:
✅ Quick setup (just change the URL)
✅ No backend code needed
✅ Works immediately

## Cons:
❌ Dependent on third-party services
❌ Rate limits and reliability concerns
❌ Less control over caching and errors
❌ CORS Anywhere requires user activation
