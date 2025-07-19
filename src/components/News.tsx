import React from 'react';
import { FileText } from 'lucide-react';

const News: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Market Insights</h1>
          <p className="text-gray-600 mt-1">Stay updated with market news and trading insights</p>
        </div>
      </div>

      {/* Placeholder for new content */}
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">News Section Coming Soon</h3>
          <p className="text-gray-600 max-w-md">
            This section will be redesigned to provide valuable market insights and trading news for our users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
