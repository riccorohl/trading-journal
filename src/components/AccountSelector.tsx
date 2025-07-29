import React, { useState } from 'react';
import { useTradeContext } from '../contexts/TradeContext';
import { TradingAccount, AccountFormData } from '../types/trade';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Building2, 
  CreditCard, 
  Plus, 
  Settings, 
  TrendingUp,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AccountSelectorProps {
  showStats?: boolean;
  className?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  showStats = false, 
  className = "" 
}) => {
  const { 
    accounts, 
    currentAccount, 
    accountsLoading, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    setActiveAccount,
    getAccountStats 
  } = useTradeContext();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>();

  const onSubmit = async (data: AccountFormData) => {
    try {
      const accountData = {
        ...data,
        balance: parseFloat(data.balance),
        initialBalance: parseFloat(data.initialBalance),
        isActive: false, // Will be set active manually if needed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingAccount) {
        await updateAccount(editingAccount.id, accountData);
        setEditingAccount(null);
      } else {
        await addAccount(accountData);
        setShowAddDialog(false);
      }
      
      reset();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleAccountChange = async (accountId: string) => {
    try {
      await setActiveAccount(accountId);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (accounts.length <= 1) {
      alert('Cannot delete the last account. You must have at least one account.');
      return;
    }

    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const startEdit = (account: TradingAccount) => {
    setEditingAccount(account);
    reset({
      name: account.name,
      type: account.type,
      broker: account.broker,
      currency: account.currency,
      balance: account.balance.toString(),
      initialBalance: account.initialBalance.toString(),
      platform: account.platform,
      description: account.description || '',
    });
    setShowAddDialog(true);
  };

  const accountStats = currentAccount ? getAccountStats(currentAccount.id) : null;

  if (accountsLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Account Selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select 
            value={currentAccount?.id || ''} 
            onValueChange={handleAccountChange}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <SelectValue placeholder="Select account..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{account.name}</span>
                      <Badge variant={account.type === 'live' ? 'default' : 'secondary'}>
                        {account.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {account.currency} {account.balance.toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </DropdownMenuItem>
            {currentAccount && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => startEdit(currentAccount)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteAccount(currentAccount.id)}
                  className="text-red-600"
                  disabled={accounts.length <= 1}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Account Stats (if enabled and account selected) */}
      {showStats && currentAccount && accountStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">P&L</p>
                  <p className={`text-sm font-medium ${
                    accountStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentAccount.currency} {accountStats.totalPnL.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Win Rate</p>
                  <p className="text-sm font-medium">
                    {accountStats.winRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Trades</p>
                  <p className="text-sm font-medium">
                    {accountStats.totalTrades}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Platform</p>
                  <p className="text-sm font-medium uppercase">
                    {currentAccount.platform}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount 
                ? 'Update your trading account details.' 
                : 'Create a new trading account to organize your trades.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Account name is required' })}
                placeholder="e.g., Live Account, Demo MT4"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select {...register('type', { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select {...register('platform', { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mt4">MT4</SelectItem>
                    <SelectItem value="mt5">MT5</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="broker">Broker</Label>
              <Input
                id="broker"
                {...register('broker', { required: 'Broker is required' })}
                placeholder="e.g., OANDA, IG, Interactive Brokers"
              />
              {errors.broker && (
                <p className="text-sm text-red-600">{errors.broker.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select {...register('currency', { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  {...register('balance', { required: 'Balance is required' })}
                  placeholder="10000"
                />
                {errors.balance && (
                  <p className="text-sm text-red-600">{errors.balance.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="initialBalance">Initial Balance</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                {...register('initialBalance', { required: 'Initial balance is required' })}
                placeholder="10000"
              />
              {errors.initialBalance && (
                <p className="text-sm text-red-600">{errors.initialBalance.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Additional notes about this account..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingAccount(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAccount ? 'Update Account' : 'Add Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSelector;
