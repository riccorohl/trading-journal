
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

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 flex items-center">
          {title}
          <Info className="w-4 h-4 ml-1 text-gray-400" />
        </h3>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        
        {showProgress && (
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={progressColors[color]}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">{progressValue}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
