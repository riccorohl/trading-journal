import { useState, useEffect } from 'react';
import { AVAILABLE_WIDGETS, DEFAULT_DASHBOARD_WIDGETS, DashboardWidget } from '../config/dashboardConfig';

const STORAGE_KEY = 'tradejournal-dashboard-widgets';

export const useDashboardConfig = () => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_DASHBOARD_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

  const getSelectedWidgets = (): DashboardWidget[] => {
    return selectedWidgets
      .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
      .filter(Boolean) as DashboardWidget[];
  };

  const updateWidget = (index: number, widgetId: string) => {
    const newWidgets = [...selectedWidgets];
    newWidgets[index] = widgetId;
    setSelectedWidgets(newWidgets);
  };

  return {
    selectedWidgets,
    getSelectedWidgets,
    updateWidget,
    availableWidgets: AVAILABLE_WIDGETS
  };
};
