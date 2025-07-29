import React from 'react';

interface WidgetProps {
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ children }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      {children}
    </div>
  );
};

export default Widget;
