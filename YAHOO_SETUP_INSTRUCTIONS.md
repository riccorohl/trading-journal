# Yahoo Finance Backend Setup Instructions

## Step 1: Install Node.js Dependencies

Create a new directory for the backend service:

```bash
mkdir yahoo-finance-backend
cd yahoo-finance-backend
```

Initialize npm and install dependencies:

```bash
npm init -y
npm install express cors axios
```

## Step 2: Copy the Service File

Copy the `yahoo-finance-service.js` file to your backend directory.

## Step 3: Start the Service

```bash
node yahoo-finance-service.js
```

You should see:
- 🚀 Yahoo Finance service running on http://localhost:3001
- 📊 Supported symbols: MES, ES, MNQ, NQ

## Step 4: Test the Service

Open your browser and test:
http://localhost:3001/health

You should see: {"status":"OK","service":"Yahoo Finance Futures Data"}
