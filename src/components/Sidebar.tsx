import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Play,
  Plus,
  Upload,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onAddTrade: () => void;
  onImportTrades: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Daily Journal', icon: BookOpen },
  { id: 'trades', label: 'Trades', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'playbooks', label: 'Playbooks', icon: Play },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onAddTrade, onImportTrades }) => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">Chart Journal</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button 
          onClick={onAddTrade}
          className="w-full bg-custom-purple hover:bg-custom-purple/90 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Trade</span>
        </button>
        
        <button 
          onClick={onImportTrades}
          className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium">Import Trades</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                currentPage === item.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
            <AvatarFallback className="bg-purple-600">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
