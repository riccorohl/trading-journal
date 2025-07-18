import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DataMigrationService } from '../lib/dataMigration';

const SetupStatus: React.FC = () => {
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [migrationData, setMigrationData] = useState<{
    trades: unknown[];
    metadata: Record<string, unknown>;
  } | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if Firebase is properly configured
    const checkFirebaseConfig = () => {
      try {
        // Check if environment variables are set or if config contains placeholder values
        const hasValidConfig = !import.meta.env.VITE_FIREBASE_API_KEY?.includes('your-') || 
                               !import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('your-');
        setFirebaseConfigured(hasValidConfig);
      } catch (error) {
        setFirebaseConfigured(false);
      }
    };

    // Check for migration data
    const checkMigrationData = () => {
      const data = DataMigrationService.getLocalStorageData();
      setMigrationData(data);
    };

    checkFirebaseConfig();
    checkMigrationData();
  }, []);

  const handleBackupData = () => {
    const backup = DataMigrationService.backupLocalData();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const StatusItem: React.FC<{ 
    title: string; 
    status: 'success' | 'warning' | 'error'; 
    description: string;
    action?: React.ReactNode;
  }> = ({ title, status, description, action }) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />
    };

    return (
      <div className="flex items-start space-x-3 p-4 border rounded-lg">
        {icons[status]}
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Status</CardTitle>
          <CardDescription>
            Check your Firebase integration and migration status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Firebase Configuration Status */}
          <StatusItem
            title="Firebase Configuration"
            status={firebaseConfigured ? 'success' : 'error'}
            description={
              firebaseConfigured 
                ? 'Firebase is properly configured'
                : 'Firebase configuration needs to be set up'
            }
            action={!firebaseConfigured ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Firebase Console
                </Button>
                <Alert>
                  <AlertDescription>
                    Please follow the Firebase Setup Guide to configure your project.
                    Update the configuration in <code>src/lib/firebase.ts</code> or use environment variables.
                  </AlertDescription>
                </Alert>
              </div>
            ) : undefined}
          />

          {/* Authentication Status */}
          <StatusItem
            title="Authentication"
            status={user ? 'success' : 'warning'}
            description={
              user 
                ? `Signed in as ${user.displayName || user.email}`
                : 'Not signed in'
            }
          />

          {/* Data Migration Status */}
          {migrationData && migrationData.hasData && (
            <StatusItem
              title="Data Migration"
              status={DataMigrationService.isMigrationCompleted() ? 'success' : 'warning'}
              description={
                DataMigrationService.isMigrationCompleted()
                  ? 'Local data has been migrated to Firebase'
                  : `Found ${migrationData.trades.length} trades, ${migrationData.journalEntries.length} journal entries, and ${migrationData.playbooks.length} playbooks in local storage`
              }
              action={!DataMigrationService.isMigrationCompleted() ? (
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>
                      Local data will be automatically migrated when you sign in.
                      Consider backing up your data before migration.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackupData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup Local Data
                  </Button>
                </div>
              ) : undefined}
            />
          )}

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/Firebase_Setup_Guide.md', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('npm install firebase')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Install Command
              </Button>
              
              {migrationData && migrationData.hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBackup(!showBackup)}
                >
                  {showBackup ? 'Hide' : 'Show'} Migration Details
                </Button>
              )}
            </div>
          </div>

          {/* Migration Details */}
          {showBackup && migrationData && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Migration Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{migrationData.trades.length}</div>
                  <div className="text-sm text-gray-600">Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{migrationData.journalEntries.length}</div>
                  <div className="text-sm text-gray-600">Journal Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{migrationData.playbooks.length}</div>
                  <div className="text-sm text-gray-600">Playbooks</div>
                </div>
              </div>
            </div>
          )}

          {/* Current Status Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={firebaseConfigured ? "default" : "destructive"}>
                Firebase: {firebaseConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
              <Badge variant={user ? "default" : "secondary"}>
                Auth: {user ? 'Signed In' : 'Not Signed In'}
              </Badge>
              {migrationData && migrationData.hasData && (
                <Badge variant={DataMigrationService.isMigrationCompleted() ? "default" : "outline"}>
                  Migration: {DataMigrationService.isMigrationCompleted() ? 'Complete' : 'Pending'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupStatus;
