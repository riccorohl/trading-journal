import React from 'react';
import TradeOverview from '../components/TradeOverview';

interface TradeDetailsPageProps {
  isEmbedded?: boolean;
}

const TradeDetailsPage: React.FC<TradeDetailsPageProps> = () => {
  return <TradeOverview />;
};

export default TradeDetailsPage;