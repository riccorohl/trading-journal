# System Patterns: Architecture and Technical Decisions

## Core Architecture Overview

### **Frontend Architecture**
```
React 18 + TypeScript + Vite
├── Component Layer (UI Components)
├── Service Layer (Business Logic)
├── Context Layer (State Management)
├── Hook Layer (Reusable Logic)
└── Type Layer (TypeScript Definitions)
```

### **Directory Structure**
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── Dashboard_v2.tsx  # Main hybrid dashboard
│   ├── WidgetWrapper.tsx # Universal widget renderer
│   └── ...
├── contexts/           # React Context providers
├── lib/               # Service layer & utilities
│   ├── widgetRegistry.ts # Centralized widget configuration
│   ├── dashboardService.ts # Persistence for dashboard layout
│   └── ...
├── types/             # TypeScript definitions
└── ...
```

## Key Technical Patterns

### **1. Hybrid Dashboard Architecture**
**Pattern Description**: A two-part layout that provides a balance between stability and user customization. This is the new core pattern for the main user interface.

**Implementation (`Dashboard_v2.tsx`)**:
```tsx
// 1. Static Metrics Bar (Non-editable)
<div className="grid grid-cols-5 gap-6">
  {staticMetricWidgets.map(widget => <WidgetWrapper ... />)}
</div>

// 2. Customizable Main Grid (Editable)
<ResponsiveGridLayout ... >
  {mainWidgets.map(widgetId => <WidgetWrapper ... />)}
</ResponsiveGridLayout>
```

**Key Characteristics**:
- **Static Top Bar**: Always displays the most critical, at-a-glance metrics. This area is not editable by the user, ensuring consistency.
- **Dynamic Main Grid**: A larger, customizable grid for deeper analytical components (charts, calendars, etc.). The user has full control over the layout of this section.
- **Centralized Configuration**: The `widgetRegistry.ts` file defines which widgets belong to which section via a `category` property.

### **2. Universal Widget Rendering Pattern**
**Pattern Description**: A single, intelligent wrapper component (`WidgetWrapper`) is responsible for rendering every widget on the dashboard. This ensures 100% visual and behavioral consistency.

**Implementation (`WidgetWrapper.tsx`)**:
```tsx
const WidgetWrapper = ({ widgetId, size, ...props }) => {
  const widgetConfig = getWidgetById(widgetId);
  
  return (
    <WidgetContainer
      title={widgetConfig.title}
      headerActions={<HeaderActionsComponent ... />}
      ...
    >
      <WidgetComponent {...props} size={size} />
    </WidgetContainer>
  );
}
```

**Benefits**:
- **Single Source of Truth**: All widget "chrome" (titles, containers, remove buttons, icons) is handled in one place.
- **Pure Content Components**: Individual widget components are now simple and focused only on displaying their specific content.
- **Eliminates Bugs**: Prevents inconsistencies and bugs like the "duplicated title" issue.

### **3. Service Layer Pattern**
**Established Standard**:
```typescript
class BusinessService {
  // Caching, rate limiting, and API fallback logic
}
```

### **4. State Management Pattern**
**Context-Based Architecture**:
- `TradeContext` provides global trade and account data.
- `dashboardService` (backed by Firebase) provides persistence for the customizable grid layout.

## Design System Patterns

### **1. Visual Consistency**
- **Color-Coded Status System**: Green (profit), Red (loss), Blue (info).
- **Typography Hierarchy**: Standardized font sizes for titles and body text.
- **Card-Based Layout**: All widgets are rendered within a consistent `Card` component.

### **2. Data Visualization Pattern**
- **Professional Charts**: `Recharts` is used for all line and bar charts with advanced customization
- **Dynamic Gradient Implementation**: PerformanceChartWidget uses calculated gradient offsets based on actual data ranges for accurate P&L visualization
- **Smart Color Coding**: Automatic green/red gradient alignment with zero-axis for intuitive profit/loss representation
- **Professional Calendar**: `react-big-calendar` is used for the main calendar view, as it is purpose-built for responsive, full-container layouts
- **Data-Driven Styling**: Chart components calculate visual properties dynamically based on data characteristics

## Critical Technical Decisions

### **1. Dashboard Component Library**
- **`react-grid-layout`**: Chosen for its robustness and reliability in handling draggable and resizable grid systems. It is the foundation of the customizable section of our hybrid dashboard.
- **`react-big-calendar`**: Explicitly chosen over the `shadcn/ui` calendar for the main calendar widget. Its design is far better suited for a fluid, resizable dashboard environment, and it provides a more feature-rich experience out-of-the-box.

### **2. Data Persistence Strategy**
- **Firebase Firestore**: Used to persist the user's customized layout for the main dashboard grid. The static metrics bar does not require persistence.
- **Debounced Saving**: Layout changes are automatically saved after a 1-second debounce to prevent excessive database writes.

### **3. Feature Separation and Modularity**
- **Service Separation**: Clean separation between economic calendar functionality and removed news features
- **Component Isolation**: Widget components are self-contained with clear dependencies
- **Type Safety**: Comprehensive TypeScript validation across all components and services
- **Clean Removal Patterns**: Systematic approach to removing features without breaking dependencies

### **Recent Pattern Implementations**
- **Dynamic Gradient Calculation**: Advanced mathematical calculations for data-driven chart styling
- **Edge Case Handling**: Robust handling of all-positive, all-negative, and mixed P&L datasets
- **Clean Architecture Refactoring**: Successful feature removal while maintaining core functionality

This system architecture provides a robust, maintainable, and high-quality foundation for the application, with recent enhancements focusing on improved data visualization and streamlined feature set.
