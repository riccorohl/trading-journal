# Vercel Deployment Configuration

Create a file called `vercel.json` in your project root with this content:

```json
{
  "functions": {
    "api/futures.js": {
      "maxDuration": 30
    }
  }
}
```

This tells Vercel to treat the api/futures.js file as a serverless function.
