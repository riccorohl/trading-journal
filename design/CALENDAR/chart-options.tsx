"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Cell, ComposedChart } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingUp, BarChart3, LineChartIcon, Activity } from 'lucide-react'
import { useState } from 'react'

const performanceData = [
  { date: "Dec 04", value: 0, trades: 0, cumulative: 0 },
  { date: "Dec 05", value: 1350, trades: 3, cumulative: 1350 },
  { date: "Dec 06", value: -200, trades: 2, cumulative: 1150 },
  { date: "Dec 07", value: 800, trades: 4, cumulative: 1950 },
  { date: "Dec 08", value: -134.80, trades: 1, cumulative: 1815.20 },
]

const timeRanges = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
]

const chartTypes = [
  { label: "Bars", value: "bar", icon: BarChart3 },
  { label: "Line", value: "line", icon: LineChartIcon },
  { label: "Combined", value: "combined", icon: Activity },
]

export default function ChartOptions() {
  const [selectedRange, setSelectedRange] = useState("all")
  const [chartType, setChartType] = useState("bar")
  
  const currentValue = performanceData[performanceData.length - 1]?.cumulative || 0
  const dailyChange = performanceData[performanceData.length - 1]?.value || 0

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={performanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
                    Daily P&L: ${data.value.toLocaleString()}
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
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {performanceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={performanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
                  <p className="text-sm font-semibold text-blue-600">
                    Cumulative: ${data.cumulative.toLocaleString()}
                  </p>
                  <p className={`text-xs ${data.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Daily: ${data.value.toLocaleString()}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Line 
          type="monotone" 
          dataKey="cumulative" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderCombinedChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={performanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
                  <p className="text-sm font-semibold text-blue-600">
                    Cumulative: ${data.cumulative.toLocaleString()}
                  </p>
                  <p className={`text-xs ${data.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Daily: ${data.value.toLocaleString()}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} opacity={0.7}>
          {performanceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
        <Line 
          type="monotone" 
          dataKey="cumulative" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return renderLineChart()
      case "combined":
        return renderCombinedChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Performance Chart
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {chartType === "bar" ? "Daily P&L" : chartType === "line" ? "Cumulative P&L" : "Daily + Cumulative P&L"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={dailyChange >= 0 ? "default" : "destructive"} className="gap-1">
              <TrendingUp className={`h-3 w-3 ${dailyChange < 0 ? "rotate-180" : ""}`} />
              {dailyChange >= 0 ? "+" : ""}${dailyChange.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              {chartTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => setChartType(type.value)}
                  >
                    <Icon className="h-3 w-3" />
                    {type.label}
                  </Button>
                )
              })}
            </div>

            {/* Time Range Selector */}
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
          </div>

          {/* Current Value Display */}
          <div className="text-center py-2">
            <div className="text-3xl font-bold">
              ${currentValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Total P&L
            </div>
          </div>

          {/* Chart */}
          <div className="h-[280px] w-full">
            <ChartContainer
              config={{
                value: { label: "P&L", color: "hsl(var(--chart-1))" },
                cumulative: { label: "Cumulative", color: "hsl(var(--chart-2))" },
              }}
            >
              {renderChart()}
            </ChartContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm font-medium">Best Day</div>
              <div className="text-xs text-green-600">+$1,350</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Worst Day</div>
              <div className="text-xs text-red-600">-$200</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Avg Daily</div>
              <div className="text-xs text-muted-foreground">+$363</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Win Days</div>
              <div className="text-xs text-muted-foreground">3 of 4</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
