import TradingCalendarFixed from "../trading-calendar-fixed";

export default function Page() {
  return (
    <div className="p-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Fixed Trading Calendar</h1>
        <p className="text-muted-foreground">Clean, properly structured calendar layout</p>
      </div>
      <div className="flex justify-center">
        <TradingCalendarFixed />
      </div>
    </div>
  );
}
