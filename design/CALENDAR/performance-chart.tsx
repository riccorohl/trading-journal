"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, BarChart, Bar, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { cn } from "@/lib/utils"

// Sample performance data
const performanceData = [
  { date: "Dec 04", value: 0, trades: 0 },
  { date: "Dec 05", value: 1350, trades: 3 },
  { date: "Dec 06", value: -200, trades: 2 },
  { date: "Dec 07", value: 800, trades: 4 },
  { date: "Dec 08", value: 1815.20, trades: 1 },
]

const timeRanges = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
]

export default function PerformanceChart() {
  const [selectedRange, setSelectedRange] = useState("all")
  
  const currentValue = performanceData[performanceData.length - 1]?.value || 0
  const previousValue = performanceData[performanceData.length - 2]?.value || 0
  const change = currentValue - previousValue
  const changePercent = previousValue !== 0 ? ((change / Math.abs(previousValue)) * 100).toFixed(1) : "0"

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Performance Chart
          </CardTitle>
          <p className="text-sm text-muted-foreground">Cumulative P&L over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={change >= 0 ? "default" : "destructive"} className="gap-1">
            <TrendingUp className={`h-3 w-3 ${change < 0 ? "rotate-180" : ""}`} />
            {change >= 0 ? "+" : ""}{changePercent}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Type Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Current P&L
            </div>
          </div>
        </div>

        {/* Bar Chart - Most Common for P&L */}
        <div className="h-[240px] w-full">
          <ChartContainer
            config={{
              value: {
                label: "P&L",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p className={`text-sm font-semibold ${data.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            P&L: ${data.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Trades: {data.trades}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[2, 2, 0, 0]}
                  fill={(entry) => entry.value >= 0 ? '#22c55e' : '#ef4444'}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm font-medium">Best Day</div>
            <div className="text-xs text-green-600">+$1,015.20</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Worst Day</div>
            <div className="text-xs text-red-600">-$200.00</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Avg Daily</div>
            <div className="text-xs text-muted-foreground">+$363.04</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
