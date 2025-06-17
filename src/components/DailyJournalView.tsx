import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade } from '../lib/firebaseService';
import { 
  ChevronLeft,
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  FileText,
  BarChart3,
  Target,
  Brain,
  Calendar,
  Clock
} from 'lucide-react';
import TradeReviewModal from './TradeReviewModal';

interface DailyJournalViewProps {
  selectedDate: Date;
  onClose: () => void;
}

interface PreSessionData {
  marketBias: 'bullish' | 'bearish' | 'neutral' | '';
  keyLevels: string;
  newsEvents: NewsEvent[];
  tradingPlan: string;
  riskLimit: string;
  goals: string;
}

interface NewsEvent {
  time: string;
  event: string;
  impact: 'low' | 'medium' | 'high';
}

interface PostSessionData {
  sessionReview: string;
  lessonsLearned: string;
  mistakesToAvoid: string;
  tomorrowsPrep: string;
  emotionalState: string;
  improvements: string;
}

export default function DailyJournalView({ selectedDate, onClose }: DailyJournalViewProps) {
  const { trades } = useTradeContext();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pre-session state
  const [preSession, setPreSession] = useState<PreSessionData>({
    marketBias: '',
    keyLevels: '',
    newsEvents: [],
    tradingPlan: '',
    riskLimit: '',
    goals: ''
  });

  // Post-session state
  const [postSession, setPostSession] = useState<PostSessionData>({
    sessionReview: '',
    lessonsLearned: '',
    mistakesToAvoid: '',
    tomorrowsPrep: '',
    emotionalState: '',
    improvements: ''
  });

  // News event input state
  const [newEvent, setNewEvent] = useState({ time: '', event: '', impact: 'low' as const });

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const dayTrades = trades.filter(trade => trade.date === dateKey);

  // Calculate session metrics
  const sessionMetrics = {
    totalTrades: dayTrades.length,
    winners: dayTrades.filter(t => t.result === 'WIN').length,
    losers: dayTrades.filter(t => t.result === 'LOSS').length,
    totalPnL: dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
    winRate: dayTrades.length > 0 
      ? (dayTrades.filter(t => t.result === 'WIN').length / dayTrades.length * 100).toFixed(1)
      : '0'
  };

  // Load existing journal data
  useEffect(() => {
    const loadJournalData = () => {
      const savedData = localStorage.getItem(`journal_${dateKey}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setPreSession(data.preSession || preSession);
        setPostSession(data.postSession || postSession);
      }
    };
    loadJournalData();
  }, [dateKey]);

  // Save journal data
  const saveJournalData = async () => {
    setIsSaving(true);
    try {
      const data = {
        preSession,
        postSession,
        sessionMetrics,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`journal_${dateKey}`, JSON.stringify(data));
      // Show success toast or feedback
      console.log('Journal saved successfully');
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add news event
  const addNewsEvent = () => {
    if (newEvent.time && newEvent.event) {
      setPreSession({
        ...preSession,
        newsEvents: [...preSession.newsEvents, newEvent]
      });
      setNewEvent({ time: '', event: '', impact: 'low' });
    }
  };

  // Remove news event
  const removeNewsEvent = (index: number) => {
    setPreSession({
      ...preSession,
      newsEvents: preSession.newsEvents.filter((_, i) => i !== index)
    });
  };

  const impactColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Daily Journal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <button
                onClick={saveJournalData}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Close Day'}
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Pre-Session Plan */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-indigo-500" />
              Pre-Session Plan
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Market Outlook */}
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Market Outlook & Gameplan
                </h3>
                <textarea
                  value={preSession.tradingPlan}
                  onChange={(e) => setPreSession({ ...preSession, tradingPlan: e.target.value })}
                  className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="What are the current market conditions? What pairs are in focus? What is my hypothesis for the session?"
                />
              </div>

              {/* Key News Events */}
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Key News Events
                </h3>
                <div className="space-y-3">
                  {/* Existing events */}
                  {preSession.newsEvents.map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className={`w-3 h-3 rounded-full ${impactColors[event.impact]}`}></span>
                      <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{event.time}</span>
                      <p className="flex-1 text-gray-700 dark:text-gray-300">{event.event}</p>
                      <button
                        onClick={() => removeNewsEvent(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Add new event form */}
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newEvent.event}
                      onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                      placeholder="Event name"
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <select
                      value={newEvent.impact}
                      onChange={(e) => setNewEvent({ ...newEvent, impact: e.target.value as any })}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <button
                    onClick={addNewsEvent}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold"
                  >
                    + Add Event
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Trades Executed */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-500" />
              Trades Executed
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">P&L</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dayTrades.length > 0 ? (
                    dayTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4 font-semibold">{trade.symbol}</td>
                        <td className={`py-3 px-4 font-semibold ${
                          trade.direction === 'LONG' ? 'text-blue-500' : 'text-purple-500'
                        }`}>
                          {trade.direction === 'LONG' ? 'Buy' : 'Sell'}
                        </td>
                        <td className="py-3 px-4">{trade.quantity}</td>
                        <td className={`py-3 px-4 font-mono ${
                          (trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.status === 'open' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {trade.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No trades recorded for this session
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Post-Session Review */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-indigo-500" />
              Post-Session Review
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Session Reflection */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Session Reflection & Notes
                </h3>
                <textarea
                  value={postSession.sessionReview}
                  onChange={(e) => setPostSession({ ...postSession, sessionReview: e.target.value })}
                  className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="How did the session go? Did I follow my plan? What did I learn? What can be improved for tomorrow?"
                />
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Performance Metrics
                </h3>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net P&L</p>
                  <p className={`text-2xl font-bold ${
                    sessionMetrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {sessionMetrics.totalPnL >= 0 ? '+' : ''}${sessionMetrics.totalPnL.toFixed(2)}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {sessionMetrics.winRate}%
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trades Taken</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {sessionMetrics.totalTrades}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Trade Review Modal */}
      {selectedTrade && (
        <TradeReviewModal
          trade={selectedTrade}
          isOpen={true}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}
