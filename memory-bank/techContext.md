# Technical Context: Technologies and Development Environment

## Core Technology Stack

### **Frontend Framework**
- **React 18** with TypeScript
  - Concurrent rendering features
  - Latest hooks and patterns
  - Strong typing throughout application
- **Vite** build tool
  - Fast development server with HMR
  - Optimized production builds
  - Plugin ecosystem for additional tooling

### **UI/UX Technologies**
- **shadcn/ui** component system
  - Based on Radix UI primitives
  - Accessible, professional components
  - Highly customizable with Tailwind
- **Tailwind CSS** for styling
  - Utility-first CSS framework
  - Consistent design system
  - Responsive design built-in
- **Lucide React** for icons
  - Consistent icon system
  - Professional appearance
  - Tree-shakeable imports

### **Data & State Management**
- **React Context API** for global state
  - TradeContext for trade data
  - AuthContext for authentication
  - Simple, effective state management
- **localStorage** for data persistence
  - Browser-based storage
  - Immediate usability
  - No server dependency

### **Form & Validation**
- **React Hook Form** for form handling
  - Performance-optimized forms
  - Minimal re-renders
  - Excellent TypeScript support
- **Zod** for schema validation
  - Type-safe validation
  - Runtime type checking
  - Integration with React Hook Form

### **Data Visualization**
- **Recharts** for professional charts
  - React-native chart library
  - Customizable, responsive charts
  - Perfect for forex analytics
- **date-fns** for date manipulation
  - Comprehensive date utilities
  - Timezone-aware operations
  - Tree-shakeable functions

### **Additional Libraries**
- **TanStack React Query** for data fetching
  - Caching and synchronization
  - Background updates
  - Error handling
- **React Router DOM** for routing
  - Client-side routing
  - Protected routes
  - Clean URL structure

## Development Environment

### **Development Tools**
- **Node.js** runtime environment
- **npm** package manager
- **TypeScript** compiler with strict mode
- **ESLint** for code linting
  - Relaxed rules for development flexibility
  - React hooks rules enforced
  - TypeScript integration

### **Build Configuration**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### **TypeScript Configuration**
- **Relaxed Settings** for development flexibility:
  - `noImplicitAny: false`
  - `noUnusedParameters: false`
  - `noUnusedLocals: false`
  - `strictNullChecks: false`
- **Path Aliases**: `@/*` maps to `./src/*`
- **Type Definitions**: Comprehensive interfaces in `src/types/`

## API Integration Architecture

### **Economic Data APIs**
**Configured Services**:
```typescript
// Multi-API configuration for redundancy
const apis: ApiConfig[] = [
  {
    name: 'alpha_vantage',
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimit: 5, // requests per minute
    endpoints: { calendar: 'function=NEWS_SENTIMENT' }
  },
  {
    name: 'financial_modeling_prep',
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    rateLimit: 10,
    endpoints: { calendar: 'economic_calendar' }
  }
];
```

**API Strategy**:
- Multiple provider fallbacks for reliability
- Conservative rate limiting (5 requests/minute)
- Comprehensive caching (15-minute timeouts)
- Graceful degradation to sample data

### **Data Caching System**
```typescript
private cache: Map<string, { data: any; timestamp: number }>;
private cacheTimeout = 15 * 60 * 1000; // 15 minutes

private getCached(key: string): any | null {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
    return cached.data;
  }
  return null;
}
```

## Development Workflow

### **Established Development Process**
1. **Feature Planning**: Clear requirements and scope definition
2. **Service Layer First**: Create business logic services with TypeScript interfaces
3. **Component Implementation**: Build UI components with professional design
4. **Integration Testing**: Test with real trade data from TradeContext
5. **Responsive Testing**: Ensure mobile and desktop compatibility
6. **Code Review**: Run `npm run lint` and address any issues

### **Code Style Guidelines**
**File Naming**:
- **PascalCase** for React components (`Dashboard.tsx`)
- **camelCase** for utilities and services (`economicCalendarService.ts`)
- **kebab-case** for pages and routes

**Import Organization**:
- External libraries first
- Internal components and utilities
- Type imports last
- Use path aliases (`@/components`) consistently

**Component Structure**:
```tsx
import React, { useState, useEffect } from 'react';
import { ExternalLibrary } from 'external-package';
import { InternalComponent } from '@/components/InternalComponent';
import { ServiceFunction } from '@/lib/service';
import type { CustomType } from '@/types/custom';

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // State declarations
  // Effect hooks
  // Event handlers
  // Render logic
  
  return (
    <div className="professional-layout">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

## Performance Considerations

### **Optimization Strategies**
- **Service Caching**: 15-minute cache timeouts for external data
- **Component Memoization**: React.memo for heavy chart components
- **Lazy Loading**: Dynamic imports for large features
- **Efficient Renders**: Proper dependency arrays in useEffect

### **Bundle Optimization**
- **Tree Shaking**: ES modules for optimal bundle size
- **Code Splitting**: Route-based splitting with React Router
- **Asset Optimization**: Vite's built-in optimizations

## Deployment & Build

### **Build Process**
```bash
# Development
npm run dev          # Start development server
npm run lint         # Check code quality
npm run build        # Create production build
npm run preview      # Preview production build
```

### **Production Configuration**
- **Static Site Generation**: Vite builds to `dist/` directory
- **Asset Optimization**: Automatic minification and compression
- **Environment Variables**: Support for production configurations

## Technical Constraints & Limitations

### **Current Limitations**
- **Data Storage**: Browser localStorage only (no cloud sync)
- **API Limits**: Free tier rate limits on external services
- **Mobile Optimization**: Some complex charts need mobile-specific layouts
- **Offline Support**: Limited offline functionality

### **Future Technical Considerations**
- **Backend Integration**: Firebase ready for cloud persistence
- **API Scaling**: Paid tiers for higher rate limits
- **Mobile App**: React Native potential for mobile apps
- **Real-Time Data**: WebSocket integration for live market data

## Security Considerations

### **Current Security Measures**
- **Client-Side Only**: No server-side vulnerabilities
- **Data Isolation**: User data stays in browser
- **API Key Management**: Environment variables for sensitive keys
- **Type Safety**: TypeScript prevents many runtime errors

### **Production Security**
- **HTTPS Only**: Secure data transmission
- **CSP Headers**: Content Security Policy implementation
- **Input Validation**: Zod schemas for all user inputs
- **XSS Prevention**: React's built-in protections

This technical foundation provides a robust, scalable platform for continued development of advanced forex trading features.

## Troubleshooting Development Environment Issues

### **Problem: Hot Module Replacement (HMR) Not Working**

**Symptoms:**
- Saved file changes (e.g., style changes, text updates) do not appear in the browser automatically.
- The Vite development server may start on a new port (e.g., `8081`) because the default port (`8080`) is occupied by a non-terminated "zombie" process.

**Permanent Solution:**
The `vite.config.ts` has been updated to permanently fix this issue. The following configuration ensures a stable development environment:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 8080,        // Lock the server to port 8080
    strictPort: true,  // Fail if the port is already in use
    watch: {
      usePolling: true,  // Use a more reliable file-watching method
    },
  },
  // ... other config
});
```

- `usePolling: true`: Fixes HMR in environments where the OS file watcher is unreliable (like WSL).
- `strictPort: true`: Prevents the server from silently moving to a new port, immediately alerting us to a port conflict.

**Manual Override (If Needed):**
If the server fails to start due to a port conflict, it means a zombie process still exists. Run the following command in the terminal to kill all Vite processes before restarting the server:

```bash
pkill -f "vite"
```
Then, run `npm run dev` again.
