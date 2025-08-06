# System Patterns: Architecture and Technical Decisions

## 1. Core Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Structure**: A layered architecture is used, consisting of:
  - **Component Layer**: UI components, with a distinction between base UI (`/ui`) and feature components.
  - **Service Layer**: Handles business logic, API interactions, and data transformations (`/lib`).
  - **Context Layer**: Manages global state (`/contexts`).
  - **Type Layer**: Centralized TypeScript definitions (`/types`).

## 2. Key Design Patterns
- **Hybrid Dashboard Architecture**: The main dashboard (`Dashboard_v2.tsx`) employs a two-part layout:
  - A **static, non-editable metrics bar** at the top for at-a-glance core metrics.
  - A **customizable 2x2 grid** below for larger, analytical widgets, managed by `react-grid-layout`.
- **Universal Widget Rendering**: A single `WidgetWrapper.tsx` component is responsible for rendering all widgets, ensuring UI and behavioral consistency (handling titles, containers, actions, etc.). This promotes a separation of concerns where individual widget components are 'pure content'.
- **Centralized Widget Registry**: `widgetRegistry.tsx` acts as the single source of truth for all widget configurations, including their ID, title, component, layout constraints, and category (`metrics`, `charts`, etc.).

## 3. Critical Technical Decisions
- **Dashboard Grid**: `react-grid-layout` was chosen for its robustness in handling draggable and resizable widgets.
- **Calendar Component**: `react-big-calendar` was explicitly selected to replace a more basic calendar, as it offers superior features and responsiveness required for a dynamic dashboard environment.
- **Data Persistence**: Firebase Firestore is used to persist the user's layout for the customizable section of the dashboard, with changes debounced to optimize database writes.
