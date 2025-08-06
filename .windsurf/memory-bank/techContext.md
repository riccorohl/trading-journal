# Tech Context: Technologies and Dependencies

## 1. Core Framework & Build Tools
- **Framework**: React 18
- **Language**: TypeScript (with strict mode enabled)
- **Build Tool**: Vite
- **Package Manager**: npm

## 2. Key Libraries & Dependencies
- **UI Components**: `shadcn/ui` provides the base component library and styling.
- **Dashboard Grid**: `react-grid-layout` is used for the draggable and resizable widget system.
- **Calendar**: `react-big-calendar` (with `moment.js` localizer) is used for the feature-rich trading calendar.
- **Charting**: `recharts` is the primary library for data visualization.
- **Icons**: `lucide-react` is used for iconography.

## 3. Backend & Data Persistence
- **Database**: Firebase Firestore is used for persisting user-specific data, such as dashboard layouts.

## 4. Development & Linting
- **Linting**: ESLint is configured with plugins for React, React Hooks, and TypeScript (`@typescript-eslint`).
- **Type Checking**: The project enforces a strict `no-explicit-any` rule to ensure type safety.
- **Scripts**: `npm run check-all` is a custom script used to run both TypeScript type checking and ESLint across the entire project.
