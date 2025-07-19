import React, { useState } from 'react';
import { Calculator, DollarSign, Target, TrendingUp, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CURRENCY_PAIRS, LOT_SIZES, calculatePipValue } from '../types/trade';

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pip-value');

  // Pip Calculator State
  const [pipCalc, setPipCalc] = useState({
    currencyPair: '',
    lotSize: '1',
    lotType: 'standard' as keyof typeof LOT_SIZES,
    accountCurrency: 'USD',
    pipValue: null as number | null,
  });

  // Position Size Calculator State
  const [positionCalc, setPositionCalc] = useState({
    accountBalance: '',
    riskPercentage: '1',
    stopLossPips: '',
    currencyPair: '',
    accountCurrency: 'USD',
    recommendedLotSize: null as number | null,
    riskAmount: null as number | null,
  });

  // Risk Calculator State
  const [riskCalc, setRiskCalc] = useState({
    lotSize: '1',
    lotType: 'standard' as keyof typeof LOT_SIZES,
    stopLossPips: '',
    currencyPair: '',
    accountCurrency: 'USD',
    riskAmount: null as number | null,
  });

  // Calculate pip value
  const calculatePipValueHandler = () => {
    try {
      if (!pipCalc.currencyPair || !pipCalc.lotSize) {
        setPipCalc(prev => ({ ...prev, pipValue: null }));
        return;
      }

      const pipValue = calculatePipValue(
        pipCalc.currencyPair,
        parseFloat(pipCalc.lotSize),
        pipCalc.lotType,
        pipCalc.accountCurrency
      );

      setPipCalc(prev => ({ ...prev, pipValue }));
    } catch (error) {
      console.error('Error calculating pip value:', error);
      setPipCalc(prev => ({ ...prev, pipValue: null }));
    }
  };

  // Calculate position size
  const calculatePositionSize = () => {
    try {
      if (!positionCalc.accountBalance || !positionCalc.riskPercentage || !positionCalc.stopLossPips || !positionCalc.currencyPair) {
        setPositionCalc(prev => ({ ...prev, recommendedLotSize: null, riskAmount: null }));
        return;
      }

      const balance = parseFloat(positionCalc.accountBalance);
      const riskPercent = parseFloat(positionCalc.riskPercentage);
      const stopLossPips = parseFloat(positionCalc.stopLossPips);

      // Calculate risk amount
      const riskAmount = (balance * riskPercent) / 100;

      // Calculate pip value for 1 standard lot
      const pipValuePerStandardLot = calculatePipValue(positionCalc.currencyPair, 1, 'standard', positionCalc.accountCurrency);
      
      // Calculate recommended lot size
      const recommendedLotSize = riskAmount / (stopLossPips * pipValuePerStandardLot);

      setPositionCalc(prev => ({ 
        ...prev, 
        recommendedLotSize,
        riskAmount 
      }));
    } catch (error) {
      console.error('Error calculating position size:', error);
      setPositionCalc(prev => ({ ...prev, recommendedLotSize: null, riskAmount: null }));
    }
  };

  // Calculate risk amount
  const calculateRiskAmount = () => {
    try {
      if (!riskCalc.lotSize || !riskCalc.stopLossPips || !riskCalc.currencyPair) {
        setRiskCalc(prev => ({ ...prev, riskAmount: null }));
        return;
      }

      const lotSize = parseFloat(riskCalc.lotSize);
      const stopLossPips = parseFloat(riskCalc.stopLossPips);

      // Calculate pip value for the given lot size and type
      const pipValue = calculatePipValue(riskCalc.currencyPair, lotSize, riskCalc.lotType, riskCalc.accountCurrency);
      
      // Calculate total risk amount
      const riskAmount = stopLossPips * pipValue;

      setRiskCalc(prev => ({ ...prev, riskAmount }));
    } catch (error) {
      console.error('Error calculating risk amount:', error);
      setRiskCalc(prev => ({ ...prev, riskAmount: null }));
    }
  };

  const tabs = [
    { id: 'pip-value', label: 'Pip Value Calculator', icon: Calculator },
    { id: 'position-size', label: 'Position Size Calculator', icon: Target },
    { id: 'risk-calculator', label: 'Risk Calculator', icon: TrendingUp },
    { id: 'info', label: 'Calculator Info', icon: Info },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pip-value':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <span>Pip Value Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pip-currency-pair">Currency Pair</Label>
                <select
                  id="pip-currency-pair"
                  value={pipCalc.currencyPair}
                  onChange={(e) => setPipCalc(prev => ({ ...prev, currencyPair: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select currency pair</option>
                  <optgroup label="Major Pairs">
                    {CURRENCY_PAIRS.MAJOR.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Minor Pairs">
                    {CURRENCY_PAIRS.MINOR.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Exotic Pairs">
                    {CURRENCY_PAIRS.EXOTIC.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pip-lot-size">Lot Size</Label>
                  <Input
                    id="pip-lot-size"
                    type="number"
                    step="0.01"
                    value={pipCalc.lotSize}
                    onChange={(e) => setPipCalc(prev => ({ ...prev, lotSize: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="pip-lot-type">Lot Type</Label>
                  <select
                    id="pip-lot-type"
                    value={pipCalc.lotType}
                    onChange={(e) => setPipCalc(prev => ({ ...prev, lotType: e.target.value as keyof typeof LOT_SIZES }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="standard">Standard (100k)</option>
                    <option value="mini">Mini (10k)</option>
                    <option value="micro">Micro (1k)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="pip-account-currency">Account Currency</Label>
                <select
                  id="pip-account-currency"
                  value={pipCalc.accountCurrency}
                  onChange={(e) => setPipCalc(prev => ({ ...prev, accountCurrency: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CHF">CHF</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="NZD">NZD</option>
                </select>
              </div>

              <Button onClick={calculatePipValueHandler} className="w-full">
                Calculate Pip Value
              </Button>

              {pipCalc.pipValue !== null && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">Pip Value: {pipCalc.accountCurrency} {pipCalc.pipValue.toFixed(2)}</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Each pip movement = {pipCalc.accountCurrency} {pipCalc.pipValue.toFixed(2)} profit/loss
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'position-size':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Position Size Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pos-account-balance">Account Balance</Label>
                  <Input
                    id="pos-account-balance"
                    type="number"
                    step="0.01"
                    value={positionCalc.accountBalance}
                    onChange={(e) => setPositionCalc(prev => ({ ...prev, accountBalance: e.target.value }))}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="pos-risk-percentage">Risk %</Label>
                  <Input
                    id="pos-risk-percentage"
                    type="number"
                    step="0.1"
                    value={positionCalc.riskPercentage}
                    onChange={(e) => setPositionCalc(prev => ({ ...prev, riskPercentage: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pos-currency-pair">Currency Pair</Label>
                <select
                  id="pos-currency-pair"
                  value={positionCalc.currencyPair}
                  onChange={(e) => setPositionCalc(prev => ({ ...prev, currencyPair: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select currency pair</option>
                  <optgroup label="Major Pairs">
                    {CURRENCY_PAIRS.MAJOR.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <Label htmlFor="pos-stop-loss">Stop Loss (pips)</Label>
                <Input
                  id="pos-stop-loss"
                  type="number"
                  step="0.1"
                  value={positionCalc.stopLossPips}
                  onChange={(e) => setPositionCalc(prev => ({ ...prev, stopLossPips: e.target.value }))}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="pos-account-currency">Account Currency</Label>
                <select
                  id="pos-account-currency"
                  value={positionCalc.accountCurrency}
                  onChange={(e) => setPositionCalc(prev => ({ ...prev, accountCurrency: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>

              <Button onClick={calculatePositionSize} className="w-full">
                Calculate Position Size
              </Button>

              {positionCalc.recommendedLotSize !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">Recommended Position</span>
                  </div>
                  <div className="space-y-1 text-blue-700">
                    <p><strong>Lot Size:</strong> {positionCalc.recommendedLotSize.toFixed(2)} standard lots</p>
                    <p><strong>Risk Amount:</strong> {positionCalc.accountCurrency} {positionCalc.riskAmount?.toFixed(2)}</p>
                    <p className="text-blue-600 text-sm">
                      Risk: {positionCalc.riskPercentage}% of account balance
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'risk-calculator':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Risk Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="risk-lot-size">Lot Size</Label>
                  <Input
                    id="risk-lot-size"
                    type="number"
                    step="0.01"
                    value={riskCalc.lotSize}
                    onChange={(e) => setRiskCalc(prev => ({ ...prev, lotSize: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="risk-lot-type">Lot Type</Label>
                  <select
                    id="risk-lot-type"
                    value={riskCalc.lotType}
                    onChange={(e) => setRiskCalc(prev => ({ ...prev, lotType: e.target.value as keyof typeof LOT_SIZES }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="standard">Standard (100k)</option>
                    <option value="mini">Mini (10k)</option>
                    <option value="micro">Micro (1k)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="risk-currency-pair">Currency Pair</Label>
                <select
                  id="risk-currency-pair"
                  value={riskCalc.currencyPair}
                  onChange={(e) => setRiskCalc(prev => ({ ...prev, currencyPair: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select currency pair</option>
                  <optgroup label="Major Pairs">
                    {CURRENCY_PAIRS.MAJOR.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <Label htmlFor="risk-stop-loss">Stop Loss Distance (pips)</Label>
                <Input
                  id="risk-stop-loss"
                  type="number"
                  step="0.1"
                  value={riskCalc.stopLossPips}
                  onChange={(e) => setRiskCalc(prev => ({ ...prev, stopLossPips: e.target.value }))}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="risk-account-currency">Account Currency</Label>
                <select
                  id="risk-account-currency"
                  value={riskCalc.accountCurrency}
                  onChange={(e) => setRiskCalc(prev => ({ ...prev, accountCurrency: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>

              <Button onClick={calculateRiskAmount} className="w-full">
                Calculate Risk Amount
              </Button>

              {riskCalc.riskAmount !== null && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Risk Amount: {riskCalc.accountCurrency} {riskCalc.riskAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-orange-600 text-sm mt-1">
                    This position risks {riskCalc.accountCurrency} {riskCalc.riskAmount.toFixed(2)} if stop loss is hit
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'info':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-purple-600" />
                <span>Calculator Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pip Value Calculator</h4>
                <p className="text-gray-600 text-sm mb-3">Calculate the monetary value of each pip movement for your position size.</p>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  <li>Enter your currency pair and position size</li>
                  <li>Select the appropriate lot type (Standard/Mini/Micro)</li>
                  <li>Choose your account currency</li>
                  <li>Get the exact pip value for P&L calculations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Position Size Calculator</h4>
                <p className="text-gray-600 text-sm mb-3">Determine optimal lot size based on your risk tolerance and stop loss distance.</p>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  <li>Input your account balance and risk percentage</li>
                  <li>Set your stop loss distance in pips</li>
                  <li>Get recommended position size that matches your risk profile</li>
                  <li>Perfect for consistent risk management</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Risk Calculator</h4>
                <p className="text-gray-600 text-sm mb-3">Calculate total risk amount for a specific position size and stop loss.</p>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  <li>Enter your intended position size</li>
                  <li>Set your stop loss distance</li>
                  <li>Know exactly how much you're risking</li>
                  <li>Essential for position management</li>
                </ul>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="text-yellow-800 text-sm space-y-2">
                    <li><strong>Accuracy:</strong> These calculators use standard forex conventions. Results are estimates and actual values may vary slightly depending on your broker.</li>
                    <li><strong>Pip Calculation:</strong> Most currency pairs use 4 decimal places (1 pip = 0.0001), except JPY pairs which use 2 decimal places (1 pip = 0.01).</li>
                    <li><strong>Risk Management:</strong> These tools are for planning purposes. Always verify calculations and never risk more than you can afford to lose.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Tools</h1>
          <p className="text-gray-600 mt-1">Professional forex calculators and utilities to enhance your trading</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tool Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Tool Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Tools;