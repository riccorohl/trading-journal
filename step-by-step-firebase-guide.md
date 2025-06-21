# Complete Step-by-Step Firebase Setup

## Step 1: Initialize Functions and Hosting

Run this command in your project root:

```bash
firebase init
```

Select these services (Auth/Storage should already be configured):
- ✅ Functions: Configure a Cloud Functions project  
- ✅ Hosting: Configure files for Firebase Hosting

When prompted:
- Use existing project: tradejournal-b5c65
- Language for Functions: TypeScript
- ESLint: Yes
- Install dependencies: Yes
- Public directory: dist
- Single-page app: Yes
- Overwrite index.html: No

## Step 2: Replace functions/src/index.ts

After firebase init creates the functions folder, replace the content of `functions/src/index.ts` with the code from `functions-index.ts` file I created.

## Step 3: Install Function Dependencies

```bash
cd functions
npm install cors axios
npm install --save-dev @types/cors
cd ..
```

## Step 4: Update firebase.json

Your firebase.json should look like this:

```json
{
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
  }
}
```

## Step 5: Build and Deploy

```bash
# Build your React app first
npm run build

# Deploy functions and hosting
firebase deploy
```

## Step 6: Test Your Function

After deployment, your function will be available at:
https://us-central1-tradejournal-b5c65.cloudfunctions.net/economicCalendarProxy

Test it with:
https://us-central1-tradejournal-b5c65.cloudfunctions.net/economicCalendarProxy?start=2025-06-21%2000:00&end=2025-06-21%2023:59&filter=2-3_USD

## Step 7: Verify Your App

Your live app will be at:
https://tradejournal-b5c65.web.app

The News section should now show real economic calendar data from MyFXBook!

## Quick Commands Summary:

```bash
# 1. Initialize
firebase init

# 2. Install function deps  
cd functions && npm install cors axios && npm install --save-dev @types/cors && cd ..

# 3. Replace functions/src/index.ts with the provided code

# 4. Build and deploy
npm run build
firebase deploy
```

That's it! Your trading journal will be live with working economic calendar data.
