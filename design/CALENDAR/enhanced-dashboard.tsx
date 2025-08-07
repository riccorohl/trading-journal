"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Trophy, DollarSign, BarChart3 } from 'lucide-react'
import PerformanceChart from './performance-chart'
import TradingCalendar from './trading-calendar'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  percentage?: number
  icon?: React.ReactNode
  variant?: "default" | "success" | "warning" | "destructive"
}

function MetricCard({ title, value, subtitle, trend, percentage, icon, variant = "default" }: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50"
      case "warning":
        return "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50"
      case "destructive":
        return "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50"
      default:
        return "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
    }
  }

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  return (
    <Card className={`transition-all hover:shadow-md ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {percentage !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    variant === "success" ? "bg-green-600" : 
                    variant === "warning" ? "bg-yellow-600" : 
                    variant === "destructive" ? "bg-red-600" : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {percentage}%
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function EnhancedDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your trading performance at a glance.</p>
      </div>

      {/* Account Selector */}
      <Card className="w-fit">
        <CardContent className="flex items-center space-x-3 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium">Default Account</span>
          </div>
          <Badge variant="secondary">demo</Badge>
          <span className="text-sm text-muted-foreground">USD 10,000</span>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net P&L"
          value="$1,815.20"
          subtitle="10 trades"
          trend="up"
          variant="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Trade Expectancy"
          value="$181.52"
          subtitle="Per trade"
          trend="up"
          variant="success"
          icon={<Target className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Profit Factor"
          value="3.88"
          subtitle="Risk-adjusted returns"
          percentage={78}
          variant="success"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Win Rate"
          value="70.0%"
          subtitle="7 wins"
          percentage={70}
          variant="success"
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart />
        <TradingCalendar />
      </div>
    </div>
  )
}
