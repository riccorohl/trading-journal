import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

import { X } from 'lucide-react';

export interface WidgetContainerProps {
  title?: string;
  description?: string;
  size?: { w: number; h: number };
  className?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  isEditMode?: boolean;
  onRemove?: () => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  title,
  description,
  size = { w: 2, h: 2 },
  className,
  headerActions,
  children,
  isEditMode = false,
  onRemove,
}) => {
  // Calculate responsive classes based on widget size
  const isCompact = size.w <= 2;
  const isSmall = size.w <= 3;
  const isMedium = size.w <= 4;
  const isLarge = size.w > 4;

  return (
    <Card className={cn(
      "h-full flex flex-col",
      "border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200",
      "bg-white rounded-lg",
      className
    )}>
      {/* Widget Header (if title provided) */}
      {title && (
        <CardHeader className={cn(
          "flex-shrink-0 pb-3",
          isCompact ? "px-3 pt-3" : "px-4 pt-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className={cn(
                "font-semibold text-gray-900 truncate",
                isCompact ? "text-sm" : "text-base"
              )}>
                {title}
              </CardTitle>
              {description && !isCompact && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex-shrink-0 ml-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Remove Button (only in edit mode) */}
      {isEditMode && onRemove && (
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
          style={{ 
            width: '28px', 
            height: '28px',
            transform: 'translate(50%, -50%)'
          }}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Widget Content */}
      <CardContent className={cn(
        "flex-1 flex flex-col min-h-0", // min-h-0 allows flex child to shrink
        title ? "pt-0" : "", // Remove top padding if we have a header
        isCompact ? "px-3 pb-3" : "px-4 pb-4"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default WidgetContainer;

// Export size utility functions for widgets to use
export const getWidgetSizeInfo = (size: { w: number; h: number }) => ({
  isCompact: size.w <= 2,
  isSmall: size.w <= 3,
  isMedium: size.w <= 4,
  isLarge: size.w > 4,
  isShort: size.h <= 2,
  isTall: size.h > 3,
});

// Export common widget size presets
export const WIDGET_SIZES = {
  SMALL: { w: 2, h: 2 },
  MEDIUM: { w: 3, h: 3 },
  LARGE: { w: 4, h: 4 },
  WIDE: { w: 6, h: 2 },
  TALL: { w: 2, h: 4 },
  EXTRA_LARGE: { w: 6, h: 4 },
  FULL_WIDTH: { w: 10, h: 5 },
} as const;
