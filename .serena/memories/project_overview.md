# Zella Trade Scribe - Project Overview

## Purpose

Zella Trade Scribe is a trading journal application designed to help traders track, analyze, and improve their trading performance. The application allows users to:

- Log and manage trades with detailed information
- Track performance metrics (P&L, win rate, profit factor, etc.)
- Keep a daily trading journal
- Create and manage trading playbooks
- Visualize trading performance through charts and metrics

## Tech Stack

The project is built with the following technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner and shadcn/ui Toaster

## Key Features

- **Dashboard**: Overview of trading performance with key metrics
- **Daily Journal**: Record thoughts, observations, and lessons for each trading day
- **Trade Log**: Detailed log of all trades with filtering and sorting capabilities
- **Playbooks**: Create and manage trading strategies and setups
- **Trade Entry**: Comprehensive form for adding new trades with various data points
- **Trade Import**: Functionality to import trades from external sources
- **Performance Metrics**: Calculate and display key trading metrics (P&L, win rate, profit factor, etc.)
- **Calendar Integration**: Track trading activity by date

## Data Storage

The application currently uses localStorage for data persistence. This means all data is stored in the user's browser and is not synchronized across devices or backed up to a server.

## Project Origin

The project was created using Lovable (https://lovable.dev), a platform for building web applications.