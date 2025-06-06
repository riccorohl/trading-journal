
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import DailyJournal from '../components/DailyJournal';
import TradeLog from '../components/TradeLog';
import Playbooks from '../components/Playbooks';
import AddTrade from '../components/AddTrade';
import ImportTrades from '../components/ImportTrades';
import { TradeProvider } from '../contexts/TradeContext';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showImportTrades, setShowImportTrades] = useState(false);
  const [selectedJournalDate, setSelectedJournalDate] = useState<string | null>(null);

  const handleNavigateToJournal = (date: string) => {
    setSelectedJournalDate(date);
    setCurrentPage('journal');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigateToJournal={handleNavigateToJournal} />;
      case 'journal':
        return <DailyJournal selectedDate={selectedJournalDate} />;
      case 'trades':
        return <TradeLog />;
      case 'playbooks':
        return <Playbooks />;
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
    <TradeProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={(page) => {
            setCurrentPage(page);
            if (page !== 'journal') {
              setSelectedJournalDate(null);
            }
          }}
          onAddTrade={() => setShowAddTrade(true)}
          onImportTrades={() => setShowImportTrades(true)}
        />
        <div className="flex-1 overflow-hidden">
          <div className="h-screen overflow-y-auto">
            {renderCurrentPage()}
          </div>
        </div>
        
        {showAddTrade && (
          <AddTrade onClose={() => setShowAddTrade(false)} />
        )}
        
        {showImportTrades && (
          <ImportTrades onClose={() => setShowImportTrades(false)} />
        )}
      </div>
    </TradeProvider>
  );
};

export default Index;
