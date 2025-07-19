import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    tradeAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    newsUpdates: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    shareMetrics: false,
    publicProfile: false,
    dataAnalytics: true
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileSave = () => {
    // TODO: Implement profile update logic
    console.log('Saving profile settings:', profileSettings);
  };

  const handleExportData = () => {
    // TODO: Implement data export logic
    console.log('Exporting user data...');
  };

  const handleImportData = () => {
    // TODO: Implement data import logic
    console.log('Importing user data...');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion logic
      console.log('Deleting account...');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>
        <Badge variant="secondary">
          <SettingsIcon className="w-3 h-3 mr-1" />
          Account Settings
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Profile & Account
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Privacy & Security
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Data Management
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                EA Integration
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile & Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile & Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileSettings.displayName}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      displayName: e.target.value
                    }))}
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="your.email@example.com"
                    disabled
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={profileSettings.currentPassword}
                        onChange={(e) => setProfileSettings(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        placeholder="Current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          current: !prev.current
                        }))}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={profileSettings.newPassword}
                        onChange={(e) => setProfileSettings(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        placeholder="New password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          new: !prev.new
                        }))}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={profileSettings.confirmPassword}
                        onChange={(e) => setProfileSettings(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        placeholder="Confirm password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          confirm: !prev.confirm
                        }))}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleProfileSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trade Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when trades are executed</p>
                  </div>
                  <Switch
                    checked={notificationSettings.tradeAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, tradeAlerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-gray-500">Receive daily trading performance summaries</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly trading analysis</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>News Updates</Label>
                    <p className="text-sm text-gray-500">Stay updated with market news</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newsUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, newsUpdates: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Performance Metrics</Label>
                    <p className="text-sm text-gray-500">Allow sharing anonymized performance data</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareMetrics}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, shareMetrics: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-500">Make your trading profile visible to others</p>
                  </div>
                  <Switch
                    checked={privacySettings.publicProfile}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, publicProfile: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics & Insights</Label>
                    <p className="text-sm text-gray-500">Help improve our service with usage analytics</p>
                  </div>
                  <Switch
                    checked={privacySettings.dataAnalytics}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, dataAnalytics: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="outline" onClick={handleImportData}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* EA Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                EA Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Expert Advisor Integration</h4>
                <p className="text-sm text-blue-600">
                  Connect your MetaTrader Expert Advisors to automatically sync trades and performance data.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mt4-connection">MetaTrader 4 Connection</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="mt4-connection"
                      placeholder="Server:Port (e.g., localhost:8080)"
                      className="flex-1"
                    />
                    <Button variant="outline">
                      Test Connection
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your MT4 server details to establish connection
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="mt5-connection">MetaTrader 5 Connection</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="mt5-connection"
                      placeholder="Server:Port (e.g., localhost:8081)"
                      className="flex-1"
                    />
                    <Button variant="outline">
                      Test Connection
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your MT5 server details to establish connection
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-sync Trades</Label>
                      <p className="text-sm text-gray-500">Automatically import trades from connected EAs</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-gray-500">Receive live trade updates from EAs</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Sync</Label>
                      <p className="text-sm text-gray-500">Sync EA performance metrics with journal</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Setup Instructions</h4>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Install the Zella Trade Scribe EA in your MetaTrader platform</li>
                    <li>Configure the EA with your journal API key</li>
                    <li>Enable auto-trading and confirm EA is running</li>
                    <li>Test the connection using the buttons above</li>
                  </ol>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download MT4 EA
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download MT5 EA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;