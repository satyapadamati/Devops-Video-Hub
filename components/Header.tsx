
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon, UserCircleIcon, VideoCameraIcon, ShieldCheckIcon } from './icons';

interface HeaderProps {
  currentView: 'library' | 'admin';
  setView: (view: 'library' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { user, logout } = useAuth();

  const NavButton: React.FC<{
    view: 'library' | 'admin';
    icon: React.ReactNode;
    text: string;
  }> = ({ view, icon, text }) => (
    <button
      onClick={() => setView(view)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">DevOps Video Hub</h1>
            <nav className="flex space-x-2">
              <NavButton view="library" icon={<VideoCameraIcon className="h-5 w-5" />} text="Library" />
              <NavButton view="admin" icon={<ShieldCheckIcon className="h-5 w-5" />} text="Admin" />
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
                <UserCircleIcon className="h-6 w-6 text-gray-400"/>
                <span>{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
