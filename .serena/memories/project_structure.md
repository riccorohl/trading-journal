# Project Structure

## Root Directory

The root directory contains configuration files for the project:

- `package.json`: Project dependencies and scripts
- `vite.config.ts`: Vite configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: ESLint configuration
- `index.html`: Main HTML entry point
- `postcss.config.js`: PostCSS configuration
- `components.json`: shadcn/ui components configuration

## Source Code Structure

### Main Files

- `src/main.tsx`: Application entry point
- `src/App.tsx`: Main application component
- `src/index.css`: Global CSS styles
- `src/App.css`: App-specific CSS styles
- `src/vite-env.d.ts`: Vite environment type declarations

### Directories

#### Components (`src/components`)

Contains all React components used in the application:

- `Dashboard.tsx`: Main dashboard component
- `Sidebar.tsx`: Navigation sidebar
- `DailyJournal.tsx`: Daily journal component
- `TradeLog.tsx`: Trade log component
- `Playbooks.tsx`: Playbooks component
- `AddTrade.tsx`: Form for adding trades
- `ImportTrades.tsx`: Form for importing trades
- `MetricCard.tsx`: Card for displaying metrics
- `CalendarWidget.tsx`: Calendar component
- UI components in `src/components/ui` (shadcn/ui components)

#### Pages (`src/pages`)

Contains page-level components:

- `Index.tsx`: Main page component
- `NotFound.tsx`: 404 page

#### Contexts (`src/contexts`)

Contains React context providers:

- `TradeContext.tsx`: Context for managing trade data

#### Hooks (`src/hooks`)

Contains custom React hooks:

- `use-toast.ts`: Hook for displaying toast notifications

#### Types (`src/types`)

Contains TypeScript type definitions:

- `trade.ts`: Types for trade data

#### Lib (`src/lib`)

Contains utility functions and libraries.

### Public Directory

The `public` directory contains static assets that are served directly:

- Images
- Fonts
- Other static files

## Data Flow

1. The application starts at `main.tsx`, which renders the `App` component
2. `App.tsx` sets up the routing and global providers
3. The main page is `Index.tsx`, which manages the current view
4. Trade data is managed through the `TradeContext` provider
5. Components interact with the context to read and write data
6. Data is persisted to localStorage