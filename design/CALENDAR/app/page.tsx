import TradingCalendarWidget from "../trading-calendar-widget";

// Sample trades data for testing
const sampleTrades = [
  { id: '1', date: '2025-01-06', pnl: 450.20 },
  { id: '2', date: '2025-01-12', pnl: -120.50 },
  { id: '3', date: '2025-01-15', pnl: 890.75 },
  { id: '4', date: '2025-01-22', pnl: 234.10 },
  { id: '5', date: '2025-01-28', pnl: -67.30 },
];

export default function Page() {
  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
    // This would open your details modal
  };

  return (
    <div className="p-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading Calendar Widget</h1>
        <p className="text-muted-foreground">Follows the perfect widget blueprint</p>
      </div>
      
      {/* Widget Container */}
      <div className="h-[600px] border rounded-lg bg-background">
        <TradingCalendarWidget trades={sampleTrades} onDateClick={handleDateClick} />
      </div>
    </div>
  );
}
