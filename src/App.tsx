import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataInitializationService } from './services/DataInitializationService';
import AppLayout from './components/AppLayout';
import { useAuthStore } from './stores/authStore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchList } from './components/matches/MatchList';
import { TournamentList } from './components/tournaments/TournamentList';
import { ProfileForm } from './components/profile/ProfileForm';
import { initSentry } from './lib/sentry';

// Import all CSS files
import './index.css';
import './styles/base.css';
import './styles/dark-mode.css';
import './styles/light-mode.css';
import './styles/animations.css';
import './styles/shared.css';
import './styles/sidebar.css';
import './styles/rankings.css';

// Import page-specific styles
import './styles/pages/login.css';
import './styles/pages/onboarding.css';
import './styles/pages/dashboard.css';
import './styles/pages/tournaments.css';
import './styles/pages/matches.css';
import './styles/pages/profile.css';
import './styles/pages/umpire.css';

// Import component-specific styles
import './styles/components/multi-select-calendar.css';
import './styles/components/tournament-form.css';

// Initialize Sentry
initSentry();

function App() {
  const { initialize, loading, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    
    init();
  }, [initialize]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-standard)' }}>
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <SignUpForm /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/matches" element={user ? <MatchList /> : <Navigate to="/login" replace />} />
      <Route path="/tournaments" element={user ? <TournamentList /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={user ? <ProfileForm /> : <Navigate to="/login" replace />} />
      
      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;