import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchList } from './components/matches/MatchList';
import { TournamentList } from './components/tournaments/TournamentList';
import { ProfileForm } from './components/profile/ProfileForm';
import { initSentry } from './lib/sentry';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';

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

  // For authenticated users, show the app layout with sidebar
  if (user) {
    return (
      <ThemeProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/matches" element={<MatchList />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/profile" element={<ProfileForm />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // For unauthenticated users, show auth routes
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;