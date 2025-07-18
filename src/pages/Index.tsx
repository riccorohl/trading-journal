import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AddTrade from '../components/AddTrade';
import TradeLog from '../components/TradeLog';
import DailyJournal from '../components/DailyJournal';
import Playbooks from '../components/Playbooks';
import Reports from '../components/Reports';
import News from '../components/NewsNew';
import ImportTrades from '../components/ImportTrades';
import EAIntegration from '../components/EAIntegration';
import TradeDetailsPage from './TradeDetailsPage';
import SettingsPage from './SettingsPage';

const Index: React.FC = () => {
  const { tradeId } = useParams<{ tradeId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showImportTrades, setShowImportTrades] = useState(false);

  // Handle URL changes for special pages
  useEffect(() => {
    if (tradeId) {
      setCurrentPage('trade-details');
      setShowAddTrade(false);
      setShowImportTrades(false);
    } else if (location.pathname === '/settings') {
      setCurrentPage('settings');
      setShowAddTrade(false);
      setShowImportTrades(false);
    } else if (location.pathname === '/') {
      // Reset to dashboard when on home page
      setCurrentPage('dashboard');
      setShowAddTrade(false);
      setShowImportTrades(false);
    }
  }, [tradeId, location.pathname]);

  const handlePageChange = (page: string) => {
    // Handle URL navigation for special pages
    if (page === 'settings') {
      navigate('/settings');
      return;
    }
    
    // If navigating away from trade details or settings, update URL
    if ((tradeId && page !== 'trade-details') || (location.pathname === '/settings' && page !== 'settings')) {
      navigate('/');
    }
    
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
      case 'ea-integration':
        return <EAIntegration />;
      case 'playbooks':
        return <Playbooks />;
      case 'trade-details':
        return tradeId ? <TradeDetailsPage isEmbedded={true} /> : <TradeLog />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={showAddTrade ? 'add-trade' : showImportTrades ? 'import-trades' : tradeId ? 'trades' : currentPage} 
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