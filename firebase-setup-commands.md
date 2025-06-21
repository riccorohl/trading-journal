# Step-by-Step Firebase Setup Commands

## Step 1: Add Functions and Hosting to your existing Firebase project

```bash
firebase init

# You'll see the Firebase CLI setup wizard
# Select these additional services (Auth and Storage should already be set):
# ✅ Functions: Configure a Cloud Functions project
# ✅ Hosting: Configure files for Firebase Hosting and (optionally) GitHub Action deploys

# When prompted:
# ? Please select an option: Use an existing project
# ? Select a default Firebase project: tradejournal-b5c65

# For Functions:
# ? What language would you like to use to write Cloud Functions? TypeScript
# ? Do you want to use ESLint to catch probable bugs and enforce style? Yes
# ? Do you want to install dependencies with npm now? Yes

# For Hosting:
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app (rewrite all urls to /index.html)? Yes
# ? Set up automatic builds and deploys with GitHub? No
# ? File dist/index.html already exists. Overwrite? No
```

This will create:
- `functions/` folder with TypeScript setup
- `firebase.json` configuration file
- `.firebaserc` project configuration

## Step 2: Verify your firebase.json looks like this:

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
    ]
  }
}
```

## Step 3: After initialization, continue with the next steps...
