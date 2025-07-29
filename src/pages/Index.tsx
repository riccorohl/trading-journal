import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardV2 from '../components/Dashboard_v2';
import AddTrade from '../components/AddTrade';
import TradeLog from '../components/TradeLog';
import DailyJournal from '../components/DailyJournal';
import Playbooks from '../components/Playbooks';
import Reports from '../components/Reports';
import News from '../components/News';
import Tools from '../components/Tools';
import ImportTrades from '../components/ImportTrades';
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
      // Check if we have navigation state for specific page
      const navigationState = location.state as { page?: string } | null;
      if (navigationState?.page) {
        setCurrentPage(navigationState.page);
      } else {
        // Reset to dashboard when on home page
        setCurrentPage('dashboard');
      }
      setShowAddTrade(false);
      setShowImportTrades(false);
    }
  }, [tradeId, location.pathname, location.state]);

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
    setCurrentPage('trades');
  };

  const handleCloseImportTrades = () => {
    setShowImportTrades(false);
    setCurrentPage('trades');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardV2 />;
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
      case 'tools':
        return <Tools />;
      case 'trade-details':
        return tradeId ? <TradeDetailsPage isEmbedded={true} /> : <TradeLog />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardV2 />;
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
      
      {/* Modal Overlays */}
      {showAddTrade && (
        <AddTrade onClose={handleCloseAddTrade} />
      )}
      
      {showImportTrades && (
        <ImportTrades onClose={handleCloseImportTrades} />
      )}
    </div>
  );
};

export default Index;
