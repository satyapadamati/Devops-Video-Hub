import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheckIcon } from './icons';

const RestrictedAccess: React.FC = () => {
  const { user, logout, requestAccess, pendingRequests } = useAuth();

  const handleRequestAccess = () => {
    if (user?.email) {
      requestAccess(user.email);
    }
  };

  const hasRequested = user?.email && pendingRequests.includes(user.email);

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full max-w-lg p-8 text-center bg-gray-800 rounded-xl shadow-lg">
        <ShieldCheckIcon className="mx-auto h-16 w-16 text-yellow-400" />
        <h2 className="mt-4 text-3xl font-bold text-white">Access Restricted</h2>
        <p className="mt-2 text-gray-400">
          Your email address <span className="font-medium text-white">{user?.email}</span> is not on the permission list.
        </p>
        <p className="mt-1 text-gray-400">Please contact the administrator or request access below.</p>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleRequestAccess}
            disabled={hasRequested}
            className={`px-6 py-3 rounded-md text-white font-semibold transition-colors duration-300 ${
              hasRequested 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {hasRequested ? 'Request Sent!' : 'Request Access'}
          </button>
          <button
            onClick={logout}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestrictedAccess;