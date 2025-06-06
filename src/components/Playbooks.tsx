
import React, { useState } from 'react';
import { Plus, BookOpen, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Playbook {
  id: string;
  title: string;
  description: string;
  marketConditions: string;
  entryParameters: string;
  exitParameters: string;
  color: string;
  timesUsed?: number;
  tradesWon?: number;
  tradesLost?: number;
}

const Playbooks = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [showAddPlaybook, setShowAddPlaybook] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    marketConditions: '',
    entryParameters: '',
    exitParameters: '',
    color: '#3B82F6'
  });

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlaybook: Playbook = {
      id: Date.now().toString(),
      ...formData,
      timesUsed: 0,
      tradesWon: 0,
      tradesLost: 0
    };
    
    setPlaybooks([...playbooks, newPlaybook]);
    setFormData({
      title: '',
      description: '',
      marketConditions: '',
      entryParameters: '',
      exitParameters: '',
      color: '#3B82F6'
    });
    setShowAddPlaybook(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaybookClick = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
  };

  const calculateWinRate = (playbook: Playbook) => {
    const totalTrades = (playbook.tradesWon || 0) + (playbook.tradesLost || 0);
    if (totalTrades === 0) return 0;
    return Math.round(((playbook.tradesWon || 0) / totalTrades) * 100);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trading Playbooks</h1>
        <Button 
          onClick={() => setShowAddPlaybook(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Playbook
        </Button>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playbooks.map((playbook) => (
          <div
            key={playbook.id}
            className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePlaybookClick(playbook)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: playbook.color }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{playbook.title}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{playbook.description}</p>
            <div className="text-xs text-gray-500">
              Used {playbook.timesUsed || 0} times
            </div>
          </div>
        ))}
      </div>

      {playbooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No playbooks yet</h3>
          <p className="text-gray-600">Create your first trading strategy playbook to get started.</p>
        </div>
      )}

      {/* Add Playbook Dialog */}
      <Dialog open={showAddPlaybook} onOpenChange={setShowAddPlaybook}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Playbook</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title of Playbook</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter playbook title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your trading strategy"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="marketConditions">Market Conditions</Label>
              <Textarea
                id="marketConditions"
                value={formData.marketConditions}
                onChange={(e) => handleInputChange('marketConditions', e.target.value)}
                placeholder="When to use this playbook (market conditions, timeframe, etc.)"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="entryParameters">Entry Parameters</Label>
              <Textarea
                id="entryParameters"
                value={formData.entryParameters}
                onChange={(e) => handleInputChange('entryParameters', e.target.value)}
                placeholder="Entry criteria, signals, and conditions"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="exitParameters">Exit Parameters</Label>
              <Textarea
                id="exitParameters"
                value={formData.exitParameters}
                onChange={(e) => handleInputChange('exitParameters', e.target.value)}
                placeholder="Exit criteria, profit targets, stop losses"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex space-x-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('color', color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddPlaybook(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Create Playbook
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Playbook Details Dialog */}
      <Dialog open={!!selectedPlaybook} onOpenChange={() => setSelectedPlaybook(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPlaybook && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedPlaybook.color }}
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <DialogTitle className="text-xl">{selectedPlaybook.title}</DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Times Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold">{selectedPlaybook.timesUsed || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        Wins
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-green-600">{selectedPlaybook.tradesWon || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                        Losses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-red-600">{selectedPlaybook.tradesLost || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold">{calculateWinRate(selectedPlaybook)}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Playbook Details */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Description</Label>
                    <p className="mt-1 text-gray-600">{selectedPlaybook.description}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Market Conditions</Label>
                    <p className="mt-1 text-gray-600">{selectedPlaybook.marketConditions}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Entry Parameters</Label>
                    <p className="mt-1 text-gray-600">{selectedPlaybook.entryParameters}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Exit Parameters</Label>
                    <p className="mt-1 text-gray-600">{selectedPlaybook.exitParameters}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playbooks;
