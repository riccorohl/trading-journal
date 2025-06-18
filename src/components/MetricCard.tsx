import React from 'react';
import { Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'red' | 'green' | 'blue' | 'purple';
  showProgress?: boolean;
  progressValue?: number;
  trend?: 'up' | 'down';
  showChart?: boolean;
  chartData?: Array<{ name: string; value: number }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  showProgress = false,
  progressValue = 0,
  trend,
  showChart = false,
  chartData = []
}) => {
  const colorClasses = {
    red: 'text-red-500 border-red-200',
    green: 'text-green-500 border-green-200', 
    blue: 'text-blue-500 border-blue-200',
    purple: 'text-purple-500 border-purple-200'
  };

  const progressColors = {
    red: 'stroke-red-500',
    green: 'stroke-green-500',
    blue: 'stroke-blue-500', 
    purple: 'stroke-purple-500'
  };

  const circumference = 2 * Math.PI * 20;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  // Chart colors for pie chart
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 flex items-center mb-2">
            {title}
            <Info className="w-3 h-3 ml-1 text-gray-400" />
          </h3>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && (
            <div className="text-sm text-gray-500">{subtitle}</div>
          )}
        </div>
        
        {/* Chart Section */}
        {showChart && chartData.length > 0 && (
          <div className="w-16 h-16 ml-3 flex-shrink-0">
            {title === "Profit Factor" ? (
              // Simple gauge for profit factor
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="#10b981"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(chartData[0].value / 5, 1) * 150} 150`}
                  />
                </svg>
              </div>
            ) : (
              // Pie chart for win rate
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        
        {/* Progress Circle */}
        {showProgress && (
          <div className="relative w-12 h-12 ml-3 flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={progressColors[color]}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">{progressValue}%</span>
            </div>
          </div>
        )}

        {/* Trend Indicator */}
        {trend && (
          <div className={`ml-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;