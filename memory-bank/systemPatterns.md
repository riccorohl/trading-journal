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
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Reports.tsx     # Analytics & reporting (2000+ lines)
│   ├── Tools.tsx       # Risk management tools
│   ├── Trade*.tsx      # Trade-related components
│   └── News.tsx        # Economic calendar & news
├── contexts/           # React Context providers
├── lib/               # Service layer & utilities
│   ├── *Service.ts    # Business logic services
│   ├── firebase.ts    # Data persistence
│   └── utils.ts       # Shared utilities
├── types/             # TypeScript definitions
├── hooks/             # Custom React hooks
└── pages/             # Page-level components
```

## Key Technical Patterns

### **1. Service Layer Pattern**
**Established Standard**:
```typescript
class BusinessService {
  private cache: Map<string, { data: any; timestamp: number }>;
  private apis: ApiConfig[];
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes
  
  // Rate limiting protection
  private canMakeRequest(): boolean {
    // Conservative rate limiting logic
  }
  
  // Cache management
  private getCached(key: string): any | null {
    // Timestamp-based cache validation
  }
  
  // Main data fetching with fallbacks
  async getData(): Promise<DataType[]> {
    // 1. Check cache first
    // 2. Try APIs with rate limiting
    // 3. Fallback to sample data
    // 4. Comprehensive error handling
  }
}
```

**Benefits**:
- Consistent API interaction patterns
- Built-in caching and rate limiting
- Graceful degradation with sample data
- TypeScript type safety throughout

### **2. Component Architecture Pattern**
**Multi-Tab Complex Features**:
```tsx
// Standard pattern for complex features
const ComplexFeature: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const { trades } = useTradeContext(); // Real data integration
  
  return (
    <Tabs defaultValue="main">
      <TabsList>
        <TabsTrigger value="main">Main Analysis</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>
      
      <TabsContent value="main">
        {/* Professional card-based layout */}
      </TabsContent>
    </Tabs>
  );
};
```

**Established Standards**:
- 4+ tabs for comprehensive features
- Real-time data integration with TradeContext
- Professional loading states and error handling
- Responsive design with mobile considerations

### **3. State Management Pattern**
**Context-Based Architecture**:
```typescript
// TradeContext provides global trade data
const TradeContext = createContext<{
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
}>();

// Components consume context for real-time data
const { trades } = useTradeContext();
const filteredTrades = trades.filter(/* forex-specific filtering */);
```

**Benefits**:
- Single source of truth for trade data
- Real-time updates across all components
- Type-safe data access throughout application

### **4. Data Integration Pattern**
**Real-Time Analysis Integration**:
```typescript
// Services integrate with actual user data
analyzeTradeRisk(tradeDate: string, tradePair: string): RiskAnalysis {
  const relevantEvents = this.getEventsForDate(tradeDate);
  const pairCurrencies = tradePair.split('/');
  const impactingEvents = relevantEvents.filter(event => 
    pairCurrencies.includes(event.currency)
  );
  
  return {
    riskLevel: calculateRisk(impactingEvents),
    recommendations: generateRecommendations(impactingEvents)
  };
}
```

## Design System Patterns

### **1. Visual Consistency**
**Color-Coded Status System**:
- **Green**: Positive/Safe (low risk, profits, good performance)
- **Yellow**: Caution/Medium (moderate risk, neutral events)
- **Red**: Warning/High (high risk, losses, critical alerts)
- **Blue**: Information/Navigation (links, buttons, info states)

**Typography Hierarchy**:
- **H1**: Page titles (text-3xl font-bold)
- **H2**: Section headers (text-xl font-semibold)
- **H3**: Card titles (text-lg font-medium)
- **Body**: Standard text (text-sm, text-gray-600)

### **2. Component Composition Pattern**
**Card-Based Layout Standard**:
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="w-5 h-5" />
      Feature Name
    </CardTitle>
    <CardDescription>Clear feature description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Feature content with professional spacing */}
  </CardContent>
</Card>
```

### **3. Data Visualization Pattern**
**Professional Charts with Recharts**:
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#8884d8" 
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>
```

## Critical Technical Decisions

### **1. Technology Stack Rationale**
- **React 18**: Latest features, concurrent rendering
- **TypeScript**: Type safety for complex forex data structures
- **Vite**: Fast development builds and hot reload
- **shadcn/ui**: Professional component system with customization
- **Tailwind CSS**: Utility-first styling for consistent design
- **Recharts**: Professional charts with forex-specific customizations

### **2. Data Persistence Strategy**
**Current**: localStorage for browser-based storage
**Benefits**: Immediate usability, no server dependency
**Limitations**: No cross-device sync, browser storage limits
**Future**: Firebase integration ready for cloud persistence

### **3. Performance Optimization Patterns**
**Established Optimizations**:
- Service-level caching with timestamp validation
- React.memo for heavy chart components
- Lazy loading for complex features
- Efficient re-renders with proper dependency arrays

### **4. Error Handling Strategy**
**Comprehensive Error Boundaries**:
- Service-level try/catch with fallback data
- User-friendly error messages with actionable guidance
- Graceful degradation when APIs are unavailable
- Professional error states in UI components

## Component Relationships

### **Key Component Dependencies**:
```
Dashboard → MetricCard → TradeContext
Reports → Multiple Analysis Tabs → TradeContext + Services
Tools → Risk Management Tools → TradeContext + Calculations
News → Economic Calendar → economicCalendarService + TradeContext
```

### **Service Integration Map**:
```
TradeContext ← All Components
economicCalendarService → News Component
firebaseService → TradeContext
authService → ProtectedRoute → All Pages
```

## Forex-Specific Architectural Decisions

### **1. Currency Pair Handling**
- Standardized format: "EUR/USD", "GBP/JPY"
- Base/quote currency separation for analysis
- Major pairs prioritization in calculations

### **2. Economic Data Integration**
- Real-time economic calendar integration
- Currency-specific event filtering
- Trade impact analysis with historical correlation

### **3. Risk Management Architecture**
- Real-time portfolio analysis using actual trade data
- Multi-currency exposure tracking
- Comprehensive risk scoring algorithms

This system architecture provides the foundation for continued development and ensures consistency across all features.
