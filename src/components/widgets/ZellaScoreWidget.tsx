import React from 'react';
import { WidgetProps } from '../../types/widget';

const ZellaScoreWidget: React.FC<WidgetProps> = ({ metrics, size }) => {
  const isCompact = size.w <= 2;
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      {isCompact ? (
        <>
          <div className="text-3xl font-bold text-purple-600">{Math.round(metrics.zellaScore)}</div>
          <div className="text-xs text-green-600">+1</div>
        </>
      ) : (
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle
              cx="72" cy="72" r="60" stroke="#8b5cf6" strokeWidth="8" fill="none"
              strokeLinecap="round" strokeDasharray={`${(metrics.zellaScore / 100) * 377} 377`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-purple-600">{Math.round(metrics.zellaScore)}</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZellaScoreWidget;
