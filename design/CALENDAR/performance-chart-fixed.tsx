"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Cell } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingUp, BarChart3, LineChartIcon } from 'lucide-react'
import { useState } from 'react'

const performanceData = [
  { date: "Dec 04", daily: 0, cumulative: 0, trades: 0 },
  { date: "Dec 05", daily: 1350, cumulative: 1350, trades: 3 },
  { date: "Dec 06", daily: -200, cumulative: 1150, trades: 2 },
  { date: "Dec 07", daily: 800, cumulative: 1950, trades: 4 },
  { date: "Dec 08", daily: -134.80, cumulative: 1815.20, trades: 1 },
]

const timeRanges = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
]

export default function PerformanceChartFixed() {
  const [selectedRange, setSelectedRange] = useState("all")
  const [chartType, setChartType] = useState("bar")
  
  const currentValue = performanceData[performanceData.length - 1]?.cumulative || 0
  const dailyChange = performanceData[performanceData.length - 1]?.daily || 0

  // Calculate stats
  const dailyValues = performanceData.filter(d => d.daily !== 0).map(d => d.daily)
  const bestDay = Math.max(...dailyValues)
  const worstDay = Math.min(...dailyValues)
  const avgDaily = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length
  const winDays = dailyValues.filter(d => d > 0).length

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={performanceData} 
        margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
      >
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          height={60}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `$${value}`}
          domain={['dataMin - 100', 'dataMax + 100']}
          width={60}
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="2 2" />
        <ChartTooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[120px]">
                  <p className="font-medium text-sm">{label}</p>
                  <p className={`text-sm font-semibold ${data.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${data.daily.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.trades} trades
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="daily" radius={[2, 2, 0, 0]}>
          {performanceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.daily >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={performanceData} 
        margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
      >
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          height={60}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `$${value}`}
          domain={[0, 'dataMax + 200']}
          width={60}
        />
        <ChartTooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[120px]">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    ${data.cumulative.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total P&L
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Performance Chart
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {chartType === "bar" ? "Daily P&L performance" : "Cumulative account growth"}
            </p>
          </div>
          <Badge variant={dailyChange >= 0 ? "default" : "destructive"} className="gap-1">
            <TrendingUp className={`h-3 w-3 ${dailyChange < 0 ? "rotate-180" : ""}`} />
            {dailyChange >= 0 ? "+" : ""}${dailyChange.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={chartType === "bar" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs gap-1"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="h-3 w-3" />
              Daily
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs gap-1"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-3 w-3" />
              Cumulative
            </Button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[320px] w-full">
          <ChartContainer
            config={{
              daily: { label: "Daily P&L", color: "hsl(var(--chart-1))" },
              cumulative: { label: "Cumulative P&L", color: "hsl(var(--chart-2))" },
            }}
          >
            {chartType === "bar" ? renderBarChart() : renderLineChart()}
          </ChartContainer>
        </div>

        {/* Summary Stats - Fixed Layout */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Best Day</div>
              <div className="text-lg font-semibold text-green-600">
                +${bestDay.toLocaleString()}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Worst Day</div>
              <div className="text-lg font-semibold text-red-600">
                ${worstDay.toLocaleString()}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Avg Daily</div>
              <div className="text-lg font-semibold text-muted-foreground">
                +${avgDaily.toFixed(0)}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
              <div className="text-lg font-semibold text-muted-foreground">
                {winDays}/{dailyValues.length} days
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
