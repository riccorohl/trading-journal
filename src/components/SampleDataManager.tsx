import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { removeSampleTrades, hasSampleTrades } from '../lib/sampleData';
import { Trash2, Database } from 'lucide-react';

interface SampleDataManagerProps {
  onUpdate?: () => void;
}

const SampleDataManager: React.FC<SampleDataManagerProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);
  const [hasSampleData, setHasSampleData] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check for sample data on mount
  useEffect(() => {
    const checkSampleData = async () => {
      if (user) {
        try {
          const hasSamples = await hasSampleTrades(user.uid);
          setHasSampleData(hasSamples);
        } catch (error) {
          console.error('Error checking sample data:', error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkSampleData();
  }, [user]);

  const handleRemoveSampleData = async () => {
    if (!user) return;

    setIsRemoving(true);
    try {
      const removedCount = await removeSampleTrades(user.uid);
      setHasSampleData(false);
      
      // Call onUpdate to refresh parent component
      if (onUpdate) {
        onUpdate();
      }

      console.log(`Removed ${removedCount} sample trades`);
    } catch (error) {
      console.error('Error removing sample data:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span className="text-sm">Checking sample data...</span>
      </div>
    );
  }

  if (!hasSampleData) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Database className="w-4 h-4" />
        <span className="text-sm">No sample data found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <Database className="w-4 h-4 text-yellow-600" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Sample Data Active</p>
          <p className="text-xs text-yellow-600">Demo trades are currently loaded in your journal</p>
        </div>
      </div>
      
      <button
        onClick={handleRemoveSampleData}
        disabled={isRemoving}
        className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRemoving ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1"></div>
            Removing...
          </>
        ) : (
          <>
            <Trash2 className="w-3 h-3 mr-1" />
            Clear Sample Data
          </>
        )}
      </button>
    </div>
  );
};

export default SampleDataManager;
