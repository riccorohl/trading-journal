import React, { useState } from 'react';
import { Calculator, DollarSign, Target, TrendingUp, Info, Shield, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { CURRENCY_PAIRS, LOT_SIZES, calculatePipValue } from '../types/trade';
import { useTradeContext } from '../contexts/TradeContext';

const Tools: React.FC = () => {
  const { trades } = useTradeContext();
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

  // Leverage Calculator State - Phase 3 #1
  const [leverageCalc, setLeverageCalc] = useState({
    accountBalance: '',
    riskPercentage: '2',
    experienceLevel: 'intermediate',
    tradingStyle: 'day',
    maxLeverage: null as number | null,
    safeLeverage: null as number | null,
    riskWarning: '',
  });

  // Margin Calculator State - Phase 3 #2
  const [marginCalc, setMarginCalc] = useState({
    accountBalance: '',
    leverage: '100',
    positionSize: '',
    currencyPair: '',
    marginRequired: null as number | null,
    marginAvailable: null as number | null,
    marginLevel: null as number | null,
    marginCallWarning: false,
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

  // Calculate safe leverage - Phase 3 #1
  const calculateLeverage = () => {
    try {
      if (!leverageCalc.accountBalance || !leverageCalc.riskPercentage) {
        setLeverageCalc(prev => ({ ...prev, maxLeverage: null, safeLeverage: null, riskWarning: '' }));
        return;
      }

      const balance = parseFloat(leverageCalc.accountBalance);
      const riskPercent = parseFloat(leverageCalc.riskPercentage);

      // Base leverage recommendations based on experience and trading style
      const baseLeverage = {
        beginner: { conservative: 5, day: 10, swing: 3, scalping: 15 },
        intermediate: { conservative: 10, day: 20, swing: 5, scalping: 30 },
        advanced: { conservative: 20, day: 50, swing: 10, scalping: 100 },
      };

      const maxLeverage = baseLeverage[leverageCalc.experienceLevel as keyof typeof baseLeverage]?.[leverageCalc.tradingStyle as keyof typeof baseLeverage.beginner] || 10;
      
      // Calculate safe leverage based on risk percentage
      const safeLeverage = Math.min(maxLeverage, 100 / riskPercent);

      let riskWarning = '';
      if (safeLeverage > 50) {
        riskWarning = '⚠️ High leverage detected! Consider reducing risk or using lower leverage.';
      } else if (safeLeverage > 20) {
        riskWarning = '⚡ Moderate leverage. Monitor your positions closely.';
      } else {
        riskWarning = '✅ Conservative leverage. Good risk management!';
      }

      setLeverageCalc(prev => ({ ...prev, maxLeverage, safeLeverage, riskWarning }));
    } catch (error) {
      console.error('Error calculating leverage:', error);
      setLeverageCalc(prev => ({ ...prev, maxLeverage: null, safeLeverage: null, riskWarning: '' }));
    }
  };

  // Calculate margin requirements - Phase 3 #2
  const calculateMargin = () => {
    try {
      if (!marginCalc.accountBalance || !marginCalc.leverage || !marginCalc.positionSize) {
        setMarginCalc(prev => ({ 
          ...prev, 
          marginRequired: null, 
          marginAvailable: null, 
          marginLevel: null,
          marginCallWarning: false 
        }));
        return;
      }

      const balance = parseFloat(marginCalc.accountBalance);
      const leverage = parseFloat(marginCalc.leverage);
      const positionSize = parseFloat(marginCalc.positionSize);

      // Calculate margin required (position size / leverage)
      const marginRequired = positionSize / leverage;
      
      // Calculate available margin
      const marginAvailable = balance - marginRequired;
      
      // Calculate margin level (equity / used margin * 100)
      const marginLevel = (balance / marginRequired) * 100;

      // Check for margin call warning (typically when margin level < 100%)
      const marginCallWarning = marginLevel < 100;

      setMarginCalc(prev => ({ 
        ...prev, 
        marginRequired, 
        marginAvailable, 
        marginLevel,
        marginCallWarning 
      }));
    } catch (error) {
      console.error('Error calculating margin:', error);
      setMarginCalc(prev => ({ 
        ...prev, 
        marginRequired: null, 
        marginAvailable: null, 
        marginLevel: null,
        marginCallWarning: false 
      }));
    }
  };

  const tabs = [
    { id: 'pip-value', label: 'Pip Value Calculator', icon: Calculator },
    { id: 'position-size', label: 'Position Size Calculator', icon: Target },
    { id: 'risk-calculator', label: 'Risk Calculator', icon: TrendingUp },
    { id: 'leverage-calculator', label: 'Leverage Calculator', icon: Shield },
    { id: 'margin-calculator', label: 'Margin Calculator', icon: AlertTriangle },
    { id: 'risk-dashboard', label: 'Risk Dashboard', icon: BarChart3 },
    { id: 'drawdown-analysis', label: 'Drawdown Analysis', icon: Activity },
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

      case 'leverage-calculator':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Leverage Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leverage-balance">Account Balance ($)</Label>
                  <Input
                    id="leverage-balance"
                    type="number"
                    placeholder="Enter account balance"
                    value={leverageCalc.accountBalance}
                    onChange={(e) => setLeverageCalc(prev => ({ ...prev, accountBalance: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="leverage-risk">Risk Percentage (%)</Label>
                  <Input
                    id="leverage-risk"
                    type="number"
                    placeholder="1-5"
                    value={leverageCalc.riskPercentage}
                    onChange={(e) => setLeverageCalc(prev => ({ ...prev, riskPercentage: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="experience-level">Experience Level</Label>
                  <select
                    id="experience-level"
                    value={leverageCalc.experienceLevel}
                    onChange={(e) => setLeverageCalc(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="trading-style">Trading Style</Label>
                  <select
                    id="trading-style"
                    value={leverageCalc.tradingStyle}
                    onChange={(e) => setLeverageCalc(prev => ({ ...prev, tradingStyle: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="day">Day Trading</option>
                    <option value="swing">Swing Trading</option>
                    <option value="scalping">Scalping</option>
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={calculateLeverage}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Calculate Safe Leverage
              </Button>

              {leverageCalc.safeLeverage !== null && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Leverage Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Maximum Recommended</p>
                      <p className="text-2xl font-bold text-green-600">{leverageCalc.maxLeverage}:1</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Safe Leverage</p>
                      <p className="text-2xl font-bold text-blue-600">{leverageCalc.safeLeverage?.toFixed(1)}:1</p>
                    </div>
                  </div>
                  {leverageCalc.riskWarning && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-sm text-yellow-800">{leverageCalc.riskWarning}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'margin-calculator':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Margin Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="margin-balance">Account Balance ($)</Label>
                  <Input
                    id="margin-balance"
                    type="number"
                    placeholder="Enter account balance"
                    value={marginCalc.accountBalance}
                    onChange={(e) => setMarginCalc(prev => ({ ...prev, accountBalance: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="margin-leverage">Leverage</Label>
                  <select
                    id="margin-leverage"
                    value={marginCalc.leverage}
                    onChange={(e) => setMarginCalc(prev => ({ ...prev, leverage: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="10">10:1</option>
                    <option value="20">20:1</option>
                    <option value="50">50:1</option>
                    <option value="100">100:1</option>
                    <option value="200">200:1</option>
                    <option value="500">500:1</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="margin-position">Position Size ($)</Label>
                  <Input
                    id="margin-position"
                    type="number"
                    placeholder="Enter position size"
                    value={marginCalc.positionSize}
                    onChange={(e) => setMarginCalc(prev => ({ ...prev, positionSize: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="margin-currency-pair">Currency Pair</Label>
                  <select
                    id="margin-currency-pair"
                    value={marginCalc.currencyPair}
                    onChange={(e) => setMarginCalc(prev => ({ ...prev, currencyPair: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={calculateMargin}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Calculate Margin Requirements
              </Button>

              {marginCalc.marginRequired !== null && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Margin Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Margin Required</p>
                      <p className="text-2xl font-bold text-orange-600">${marginCalc.marginRequired?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Available Margin</p>
                      <p className={`text-2xl font-bold ${(marginCalc.marginAvailable || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${marginCalc.marginAvailable?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Margin Level</p>
                      <p className={`text-2xl font-bold ${(marginCalc.marginLevel || 0) > 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {marginCalc.marginLevel?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {marginCalc.marginCallWarning && (
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                      <p className="text-sm text-red-800">
                        🚨 <strong>Margin Call Warning!</strong> Your margin level is below 100%. 
                        Consider reducing position size or adding funds to avoid forced closure.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'risk-dashboard':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Portfolio Risk Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                // Calculate risk metrics from actual trading data
                const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined);
                const openTrades = trades.filter(trade => trade.status === 'open');
                const forexTrades = closedTrades.filter(trade => trade.pips !== undefined);

                if (closedTrades.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trading Data</h3>
                      <p className="text-gray-600">
                        Add some trades to see your portfolio risk analysis.
                      </p>
                    </div>
                  );
                }

                // Calculate portfolio metrics
                const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
                const netPnL = totalPnL - totalCommissions;
                
                const winningTrades = closedTrades.filter(trade => trade.pnl > 0);
                const losingTrades = closedTrades.filter(trade => trade.pnl < 0);
                const winRate = (winningTrades.length / closedTrades.length) * 100;

                // Currency exposure analysis
                const currencyExposure = forexTrades.reduce((acc, trade) => {
                  const baseCurrency = trade.symbol?.substring(0, 3) || 'Unknown';
                  const quoteCurrency = trade.symbol?.substring(3, 6) || 'Unknown';
                  
                  acc[baseCurrency] = (acc[baseCurrency] || 0) + Math.abs(trade.pnl);
                  acc[quoteCurrency] = (acc[quoteCurrency] || 0) + Math.abs(trade.pnl);
                  
                  return acc;
                }, {} as Record<string, number>);

                const topCurrencies = Object.entries(currencyExposure)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6);

                // Risk concentration
                const totalExposure = Object.values(currencyExposure).reduce((sum, exp) => sum + exp, 0);
                const concentrationRisk = totalExposure > 0 ? 
                  (Math.max(...Object.values(currencyExposure)) / totalExposure) * 100 : 0;

                // Calculate max drawdown
                let runningBalance = 0;
                let maxBalance = 0;
                let maxDrawdown = 0;
                
                for (const trade of closedTrades) {
                  runningBalance += trade.pnl;
                  if (runningBalance > maxBalance) {
                    maxBalance = runningBalance;
                  }
                  const currentDrawdown = ((maxBalance - runningBalance) / maxBalance) * 100;
                  if (currentDrawdown > maxDrawdown) {
                    maxDrawdown = currentDrawdown;
                  }
                }

                // Risk scoring
                const getRiskScore = () => {
                  let riskScore = 0;
                  
                  // Win rate risk (lower win rate = higher risk)
                  if (winRate < 40) riskScore += 3;
                  else if (winRate < 55) riskScore += 2;
                  else riskScore += 1;
                  
                  // Drawdown risk
                  if (maxDrawdown > 30) riskScore += 3;
                  else if (maxDrawdown > 15) riskScore += 2;
                  else riskScore += 1;
                  
                  // Concentration risk
                  if (concentrationRisk > 60) riskScore += 3;
                  else if (concentrationRisk > 40) riskScore += 2;
                  else riskScore += 1;
                  
                  return riskScore;
                };

                const riskScore = getRiskScore();
                const riskLevel = riskScore <= 3 ? 'Low' : riskScore <= 6 ? 'Medium' : 'High';
                const riskColor = riskLevel === 'Low' ? 'text-green-600' : 
                                 riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600';

                return (
                  <div className="space-y-6">
                    {/* Risk Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Overall Risk Level</p>
                        <p className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</p>
                        <p className="text-xs text-gray-500">Score: {riskScore}/9</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Portfolio P&L</p>
                        <p className={`text-2xl font-bold ${netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${netPnL.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{closedTrades.length} trades</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Max Drawdown</p>
                        <p className={`text-2xl font-bold ${maxDrawdown > 20 ? 'text-red-600' : maxDrawdown > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {maxDrawdown.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Historical peak</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Win Rate</p>
                        <p className={`text-2xl font-bold ${winRate > 60 ? 'text-green-600' : winRate > 45 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {winRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">{winningTrades.length}W / {losingTrades.length}L</p>
                      </div>
                    </div>

                    {/* Currency Exposure */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Currency Exposure</h3>
                        <div className="space-y-3">
                          {topCurrencies.map(([currency, exposure], index) => {
                            const percentage = totalExposure > 0 ? (exposure / totalExposure) * 100 : 0;
                            return (
                              <div key={currency} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="font-medium">{currency}</span>
                                  <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      index === 0 ? 'bg-blue-500' : 
                                      index === 1 ? 'bg-green-500' :
                                      index === 2 ? 'bg-yellow-500' :
                                      index === 3 ? 'bg-purple-500' :
                                      index === 4 ? 'bg-pink-500' : 'bg-gray-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Risk Alerts</h3>
                        <div className="space-y-3">
                          {concentrationRisk > 50 && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                              <p className="text-sm text-red-800">
                                🚨 <strong>High Concentration Risk:</strong> {concentrationRisk.toFixed(1)}% exposure in top currency
                              </p>
                            </div>
                          )}
                          {maxDrawdown > 25 && (
                            <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                              <p className="text-sm text-orange-800">
                                ⚠️ <strong>High Drawdown:</strong> {maxDrawdown.toFixed(1)}% maximum drawdown detected
                              </p>
                            </div>
                          )}
                          {winRate < 40 && (
                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-yellow-800">
                                📉 <strong>Low Win Rate:</strong> {winRate.toFixed(1)}% win rate needs improvement
                              </p>
                            </div>
                          )}
                          {openTrades.length > 5 && (
                            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <p className="text-sm text-blue-800">
                                📊 <strong>High Open Positions:</strong> {openTrades.length} active trades to monitor
                              </p>
                            </div>
                          )}
                          {riskLevel === 'Low' && (
                            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                              <p className="text-sm text-green-800">
                                ✅ <strong>Good Risk Management:</strong> Portfolio risk is well-controlled
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk Recommendations */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Risk Management Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Immediate Actions</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {concentrationRisk > 40 && <li>• Diversify currency exposure to reduce concentration risk</li>}
                            {maxDrawdown > 15 && <li>• Review position sizing strategy to limit drawdowns</li>}
                            {winRate < 50 && <li>• Analyze losing trades to improve entry/exit strategies</li>}
                            {openTrades.length > 3 && <li>• Monitor open positions closely for risk management</li>}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Strategic Improvements</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Implement correlation analysis for pair selection</li>
                            <li>• Use position sizing based on volatility</li>
                            <li>• Set maximum daily/weekly loss limits</li>
                            <li>• Regular portfolio rebalancing schedule</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        );

      case 'drawdown-analysis':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Drawdown Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                // Calculate equity curve and drawdown analysis from actual trading data
                const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined && trade.date);
                
                if (closedTrades.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trading Data</h3>
                      <p className="text-gray-600">
                        Add some closed trades to see your drawdown analysis.
                      </p>
                    </div>
                  );
                }

                // Sort trades by date for equity curve calculation
                const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                // Calculate equity curve data points
                let runningBalance = 0;
                let maxBalance = 0;
                let currentDrawdown = 0;
                let maxDrawdown = 0;
                let maxDrawdownStart = null;
                let maxDrawdownEnd = null;
                const drawdownPeriods = [];
                let currentDrawdownStart = null;

                const equityData = sortedTrades.map((trade, index) => {
                  const previousBalance = runningBalance;
                  runningBalance += trade.pnl - (trade.commission || 0);
                  
                  // Track peak balance
                  if (runningBalance > maxBalance) {
                    maxBalance = runningBalance;
                    // End current drawdown period if we've recovered
                    if (currentDrawdownStart && currentDrawdown > 0) {
                      drawdownPeriods.push({
                        start: currentDrawdownStart,
                        end: trade.date,
                        maxDD: currentDrawdown,
                        recovery: true
                      });
                      currentDrawdownStart = null;
                    }
                    currentDrawdown = 0;
                  } else {
                    // Calculate current drawdown
                    currentDrawdown = ((maxBalance - runningBalance) / maxBalance) * 100;
                    
                    // Track maximum drawdown
                    if (currentDrawdown > maxDrawdown) {
                      maxDrawdown = currentDrawdown;
                      maxDrawdownStart = currentDrawdownStart || trade.date;
                      maxDrawdownEnd = trade.date;
                    }
                    
                    // Start new drawdown period
                    if (!currentDrawdownStart && currentDrawdown > 0) {
                      currentDrawdownStart = trade.date;
                    }
                  }

                  return {
                    date: new Date(trade.date).toLocaleDateString(),
                    equity: runningBalance,
                    peak: maxBalance,
                    drawdown: currentDrawdown,
                    trade: `${trade.symbol || 'Trade'} ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}`,
                    pnl: trade.pnl
                  };
                });

                // If still in drawdown, add current period
                if (currentDrawdownStart && currentDrawdown > 0) {
                  drawdownPeriods.push({
                    start: currentDrawdownStart,
                    end: sortedTrades[sortedTrades.length - 1].date,
                    maxDD: currentDrawdown,
                    recovery: false
                  });
                }

                // Calculate recovery statistics
                const recoveredPeriods = drawdownPeriods.filter(p => p.recovery);
                const avgRecoveryTime = recoveredPeriods.length > 0 ? 
                  recoveredPeriods.reduce((sum, period) => {
                    const days = Math.floor((new Date(period.end).getTime() - new Date(period.start).getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                  }, 0) / recoveredPeriods.length : 0;

                // Current drawdown status
                const currentEquity = runningBalance;
                const currentDD = maxBalance > 0 ? ((maxBalance - currentEquity) / maxBalance) * 100 : 0;
                const isInDrawdown = currentDD > 1; // Consider >1% as significant drawdown

                // Risk assessment
                const getRiskLevel = () => {
                  if (maxDrawdown > 30) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
                  if (maxDrawdown > 15) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
                  return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
                };

                const riskAssessment = getRiskLevel();

                return (
                  <div className="space-y-6">
                    {/* Drawdown Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Maximum Drawdown</p>
                        <p className={`text-2xl font-bold ${riskAssessment.color}`}>
                          {maxDrawdown.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Historical worst</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Current Drawdown</p>
                        <p className={`text-2xl font-bold ${currentDD > 10 ? 'text-red-600' : currentDD > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {currentDD.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">{isInDrawdown ? 'In drawdown' : 'At peak'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Drawdown Periods</p>
                        <p className="text-2xl font-bold text-blue-600">{drawdownPeriods.length}</p>
                        <p className="text-xs text-gray-500">{recoveredPeriods.length} recovered</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-600">Avg Recovery Time</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {avgRecoveryTime > 0 ? `${Math.round(avgRecoveryTime)}d` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Days to recover</p>
                      </div>
                    </div>

                    {/* Equity Curve Chart */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Account Equity Curve</h3>
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={equityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'equity' ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}`,
                                name === 'equity' ? 'Account Equity' : 'Peak Balance'
                              ]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="equity" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              dot={false}
                              name="equity"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="peak" 
                              stroke="#82ca9d" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                              name="peak"
                            />
                            <ReferenceLine y={0} stroke="#ff0000" strokeDasharray="2 2" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 flex justify-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                          <span>Account Equity</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-green-500 border-dashed mr-2"></div>
                          <span>Peak Balance</span>
                        </div>
                      </div>
                    </div>

                    {/* Drawdown Analysis & Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Drawdown Periods</h3>
                        {drawdownPeriods.length > 0 ? (
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {drawdownPeriods.slice(-5).reverse().map((period, index) => {
                              const startDate = new Date(period.start).toLocaleDateString();
                              const endDate = new Date(period.end).toLocaleDateString();
                              const duration = Math.floor((new Date(period.end).getTime() - new Date(period.start).getTime()) / (1000 * 60 * 60 * 24));
                              
                              return (
                                <div key={index} className={`p-3 rounded border-l-4 ${period.recovery ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {period.recovery ? '✅ Recovered' : '🔴 Active'} Drawdown
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {startDate} - {endDate} ({duration} days)
                                      </p>
                                    </div>
                                    <span className={`text-sm font-bold ${period.recovery ? 'text-green-600' : 'text-red-600'}`}>
                                      -{period.maxDD.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No significant drawdown periods detected.</p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Recovery Recommendations</h3>
                        <div className="space-y-3">
                          {isInDrawdown && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                              <p className="text-sm text-red-800">
                                🚨 <strong>Currently in Drawdown</strong><br/>
                                Consider reducing position sizes until recovery.
                              </p>
                            </div>
                          )}
                          
                          {maxDrawdown > 20 && (
                            <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                              <p className="text-sm text-orange-800">
                                ⚠️ <strong>High Historical Drawdown</strong><br/>
                                Review risk management and position sizing strategy.
                              </p>
                            </div>
                          )}

                          {drawdownPeriods.length > 5 && (
                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-yellow-800">
                                📊 <strong>Frequent Drawdowns</strong><br/>
                                Consider more conservative entry criteria.
                              </p>
                            </div>
                          )}

                          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-sm text-blue-800">
                              💡 <strong>Recovery Strategy</strong><br/>
                              {isInDrawdown ? 
                                'Focus on high-probability setups and reduce leverage.' :
                                'Maintain current strategy but monitor for signs of new drawdown.'
                              }
                            </p>
                          </div>

                          {avgRecoveryTime > 30 && (
                            <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                              <p className="text-sm text-purple-800">
                                ⏱️ <strong>Long Recovery Periods</strong><br/>
                                Average {Math.round(avgRecoveryTime)} days to recover. Consider faster recovery strategies.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment Summary */}
                    <div className={`p-4 rounded-lg border-l-4 ${riskAssessment.bg} ${riskAssessment.color.replace('text-', 'border-')}`}>
                      <h3 className="text-lg font-semibold mb-2">
                        Drawdown Risk Assessment: <span className={riskAssessment.color}>{riskAssessment.level}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2">Risk Factors:</h4>
                          <ul className="space-y-1">
                            <li>• Maximum drawdown: {maxDrawdown.toFixed(1)}%</li>
                            <li>• Recovery time: {avgRecoveryTime > 0 ? `${Math.round(avgRecoveryTime)} days avg` : 'N/A'}</li>
                            <li>• Drawdown frequency: {drawdownPeriods.length} periods</li>
                            <li>• Current status: {isInDrawdown ? 'In drawdown' : 'At/near peak'}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            <li>• {maxDrawdown > 15 ? 'Reduce position sizes' : 'Maintain current sizing'}</li>
                            <li>• {avgRecoveryTime > 21 ? 'Improve recovery strategy' : 'Good recovery patterns'}</li>
                            <li>• {drawdownPeriods.length > 5 ? 'Review entry criteria' : 'Stable trading approach'}</li>
                            <li>• Set maximum drawdown limit at {Math.min(25, maxDrawdown + 5).toFixed(0)}%</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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