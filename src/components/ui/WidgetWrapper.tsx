import React from 'react';
import { getWidgetById } from '../../lib/widgetRegistry';
import WidgetContainer from './WidgetContainer';
import { WidgetProps } from '../../types/widget';

interface WidgetWrapperProps extends Partial<WidgetProps> {
  widgetId: string;
  size: { w: number; h: number };
  isEditMode?: boolean;
  onRemove?: (widgetId: string) => void;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widgetId,
  size,
  isEditMode = false,
  onRemove,
  ...widgetProps // This collects metrics, trades, handlers, etc.
}) => {
  const widget = getWidgetById(widgetId);
  
  if (!widget) {
    return (
      <WidgetContainer title={`Error: Widget "${widgetId}" not found`} size={size}>
        <div className="flex items-center justify-center h-full text-red-600">
          Please check the widget registry.
        </div>
      </WidgetContainer>
    );
  }

  const WidgetComponent = widget.component;
  const HeaderActionsComponent = widget.headerActions;

  return (
    <WidgetContainer
      title={widget.title}
      description={widget.description}
      size={size}
      isEditMode={isEditMode}
      onRemove={onRemove ? () => onRemove(widgetId) : undefined}
      headerActions={
        HeaderActionsComponent ? (
          <HeaderActionsComponent {...widgetProps} size={size} />
        ) : undefined
      }
    >
      <WidgetComponent {...widgetProps} size={size} />
    </WidgetContainer>
  );
};

export default WidgetWrapper;
