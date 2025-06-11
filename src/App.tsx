import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataInitializationService } from './services/DataInitializationService';
import Sidebar from './components/Sidebar';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchList } from './components/matches/MatchList';
import { TournamentList } from './components/tournaments/TournamentList';
import { ProfileForm } from './components/profile/ProfileForm';
import { initSentry } from './lib/sentry';

// Import core styles only
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
  const [isDataReady, setIsDataReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await initialize();
      
      try {
        await DataInitializationService.initializeAllData();
        setIsDataReady(true);
      } catch (error) {
        console.error('Data initialization failed:', error);
        setInitializationError('Failed to initialize application data. Please refresh the page.');
      }
    };
    
    init();
  }, [initialize]);

  if (loading || !isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-standard)' }}>
            Initializing Africa Tennis...
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-subtle)' }}>
            Setting up your tennis experience
          </p>
        </div>
      </div>
    );
  }

  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️ Initialization Error</div>
          <p className="text-red-700 mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
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
      <div className="min-h-screen">
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