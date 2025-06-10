import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <div className="app-layout">
      {/* Sidebar Navigation with Theme Toggle */}
      <Sidebar />

      {/* Main Content with Router */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/tournaments" element={<TournamentPage />} />
          <Route path="/umpire" element={<UmpirePage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
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