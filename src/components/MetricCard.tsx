
import React from 'react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'red' | 'green' | 'blue' | 'purple';
  showProgress?: boolean;
  progressValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  showProgress = false,
  progressValue = 0 
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

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 h-24 flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-xs font-medium text-gray-600 flex items-center mb-1">
          {title}
          <Info className="w-3 h-3 ml-1 text-gray-400" />
        </h3>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      
      {showProgress && (
        <div className="relative w-10 h-10 ml-3 flex-shrink-0">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 50 50">
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
    </div>
  );
};

export default MetricCard;
