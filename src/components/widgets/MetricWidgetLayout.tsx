import React from 'react';

const MetricWidgetLayout: React.FC<{ 
  mainValue: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ mainValue, subtitle }) => {
  return (
    <div className="flex flex-col justify-center h-full text-center">
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {mainValue}
      </div>
      <div className="text-sm text-gray-500" style={{ minHeight: '1.25rem' }}>
        {subtitle || '\u00A0'}
      </div>
    </div>
  );
};

export default MetricWidgetLayout;
