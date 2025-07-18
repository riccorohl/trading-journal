import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Key, Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './ui/use-toast';

interface EAConfig {
  apiKey: string;
  isEnabled: boolean;
  lastActivity: string | null;
  generatedAt: string | null;
}

const EAIntegration: React.FC = () => {
  const { user } = useAuth();
  const [eaConfig, setEaConfig] = useState<EAConfig>({
    apiKey: '',
    isEnabled: false,
    lastActivity: null,
    generatedAt: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // API endpoint URLs for EA configuration
  const getApiEndpoint = () => {
    const isDev = window.location.hostname === 'localhost';
    const baseUrl = isDev 
      ? 'http://localhost:5001/your-project-id/us-central1' 
      : 'https://us-central1-your-project-id.cloudfunctions.net';
    return `${baseUrl}/receiveEATrade`;
  };

  // Load existing EA configuration
  useEffect(() => {
    const loadEAConfig = async () => {
      if (!user) return;

      try {
        // This would typically come from Firebase Functions or Firestore
        // For now, we'll check localStorage or make an API call
        const savedConfig = localStorage.getItem(`ea_config_${user.uid}`);
        if (savedConfig) {
          setEaConfig(JSON.parse(savedConfig));
        }
      } catch (error) {
        console.error('Error loading EA config:', error);
      }
    };

    loadEAConfig();
  }, [user]);

  // Generate new API key
  const generateApiKey = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      // Call Firebase Functions to generate API key
      const functions = (await import('firebase/functions')).getFunctions();
      const generateKey = (await import('firebase/functions')).httpsCallable(functions, 'generateEAApiKey');
      
      const result = await generateKey();
      const { apiKey } = result.data as { apiKey: string };

      const newConfig = {
        apiKey,
        isEnabled: true,
        lastActivity: null,
        generatedAt: new Date().toISOString()
      };

      setEaConfig(newConfig);
      localStorage.setItem(`ea_config_${user.uid}`, JSON.stringify(newConfig));

      toast({
        title: "API Key Generated",
        description: "Your EA API key has been generated successfully.",
      });

    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard successfully.",
    });
  };

  // Mask API key for display
  const getMaskedApiKey = (key: string) => {
    if (!key) return '';
    return `${key.slice(0, 12)}${'*'.repeat(20)}${key.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">EA Integration</h2>
          <p className="text-muted-foreground">
            Connect your MetaTrader Expert Advisors to automatically import trades
          </p>
        </div>
      </div>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Generate and manage your EA API key for secure trade data transmission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!eaConfig.apiKey ? (
            <div className="text-center py-8">
              <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Key Generated</h3>
              <p className="text-muted-foreground mb-4">
                Generate an API key to enable EA integration with your trading journal
              </p>
              <Button onClick={generateApiKey} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate API Key'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">API Key Active</span>
                {eaConfig.generatedAt && (
                  <span className="text-sm text-muted-foreground">
                    Generated {new Date(eaConfig.generatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={showApiKey ? eaConfig.apiKey : getMaskedApiKey(eaConfig.apiKey)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(eaConfig.apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    value={getApiEndpoint()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(getApiEndpoint())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={generateApiKey}
                disabled={isGenerating}
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate API Key'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EA Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            EA Configuration Guide
          </CardTitle>
          <CardDescription>
            Step-by-step instructions to configure your Expert Advisor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Follow these steps to configure your MetaTrader EA with your trading journal
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">Step 1: Enable WebRequest</h4>
              <p className="text-sm text-muted-foreground mb-2">
                In MetaTrader, go to Tools → Options → Expert Advisors:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Check "Allow WebRequest for listed URL"</li>
                <li>• Add: <code className="bg-muted px-1 rounded text-xs">{getApiEndpoint().split('/')[2]}</code></li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">Step 2: Configure EA Parameters</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Set these input parameters in your EA:
              </p>
              <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
                <div>API_URL = "{getApiEndpoint()}"</div>
                <div>API_KEY = "{eaConfig.apiKey ? getMaskedApiKey(eaConfig.apiKey) : '[Generate API Key First]'}"</div>
                <div>USER_ID = "{user?.uid || '[Your User ID]'}"</div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2">Step 3: Test Connection</h4>
              <p className="text-sm text-muted-foreground">
                Your EA will automatically send trade data when trades are opened or closed.
                Check the Journal tab in MetaTrader for any connection errors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${eaConfig.isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {eaConfig.isEnabled ? 'Ready for EA Connection' : 'Not Configured'}
              </span>
            </div>
            {eaConfig.lastActivity && (
              <span className="text-sm text-muted-foreground">
                Last activity: {new Date(eaConfig.lastActivity).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EAIntegration;