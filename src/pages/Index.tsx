import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AddTrade from '../components/AddTrade';
import TradeLog from '../components/TradeLog';
import DailyJournal from '../components/DailyJournal';
import Playbooks from '../components/Playbooks';
import Reports from '../components/Reports';
import News from '../components/NewsNew';
import ImportTrades from '../components/ImportTrades';

const Index: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showImportTrades, setShowImportTrades] = useState(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowAddTrade(false);
    setShowImportTrades(false);
  };

  const handleAddTrade = () => {
    setShowAddTrade(true);
    setShowImportTrades(false);
  };

  const handleImportTrades = () => {
    setShowImportTrades(true);
    setShowAddTrade(false);
  };

  const handleCloseAddTrade = () => {
    setShowAddTrade(false);
    setCurrentPage('dashboard');
  };

  const handleCloseImportTrades = () => {
    setShowImportTrades(false);
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    if (showAddTrade) {
      return <AddTrade onClose={handleCloseAddTrade} />;
    }
    
    if (showImportTrades) {
      return <ImportTrades onClose={handleCloseImportTrades} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'trades':
        return <TradeLog />;
      case 'journal':
        return <DailyJournal />;
      case 'reports':
        return <Reports />;
      case 'news':
        return <News />;
      case 'playbooks':
        return <Playbooks />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={showAddTrade ? 'add-trade' : showImportTrades ? 'import-trades' : currentPage} 
        onPageChange={handlePageChange}
        onAddTrade={handleAddTrade}
        onImportTrades={handleImportTrades}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;