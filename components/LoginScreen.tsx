import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from './icons';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">DevOps Video Hub</h1>
            <p className="mt-2 text-gray-400">Sign in to access exclusive content</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Gmail address"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center items-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors duration-300"
          >
            <GoogleIcon className="h-6 w-6" />
            <span>Sign In with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;