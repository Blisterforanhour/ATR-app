import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import LoginPage from './LoginPage';
import OnboardingPage from './OnboardingPage';
import Dashboard from './Dashboard';
import TournamentPage from './TournamentPage';
import ProfilePage from './ProfilePage';
import RankingsPage from './RankingsPage';
import UmpirePage from './UmpirePage';
import MatchesPage from './MatchesPage';
import Sidebar from './Sidebar';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!user.isOnboarded) {
    return <OnboardingPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tournaments':
        return <TournamentPage />;
      case 'matches':
        return <MatchesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'rankings':
        return <RankingsPage />;
      case 'umpire':
        return <UmpirePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation with Theme Toggle */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content */}
      <main className="app-main">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default AppLayout;