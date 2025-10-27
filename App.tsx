import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import RestrictedAccess from './components/RestrictedAccess';
import ContentLibrary from './components/VideoLibrary';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';

type View = 'library' | 'admin';

const App: React.FC = () => {
  const { user, isAuthorized } = useAuth();
  const [view, setView] = useState<View>('library');

  const renderContent = () => {
    if (!user) {
      return (
        <main className="flex-grow flex">
          <LoginScreen />
        </main>
      );
    }

    if (!isAuthorized) {
      return (
        <main className="flex-grow flex">
          <RestrictedAccess />
        </main>
      );
    }

    return (
      <>
        <Header currentView={view} setView={setView} />
        <main className="flex-grow container mx-auto px-4 py-8">
          {view === 'library' && <ContentLibrary />}
          {view === 'admin' && <AdminDashboard />}
        </main>
      </>
    );
  };

  return (
    <div className="bg-gray-900 text-gray-100 antialiased flex flex-col min-h-screen">
      {renderContent()}
      <Footer />
    </div>
  );
};

export default App;