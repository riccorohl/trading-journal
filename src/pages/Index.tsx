
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import DailyJournal from '../components/DailyJournal';
import TradeLog from '../components/TradeLog';
import Notebook from '../components/Notebook';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'journal':
        return <DailyJournal />;
      case 'trades':
        return <TradeLog />;
      case 'notebook':
        return <Notebook />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 overflow-hidden">
        {currentPage === 'notebook' ? (
          <Notebook />
        ) : (
          <div className="h-screen overflow-y-auto">
            {renderCurrentPage()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
