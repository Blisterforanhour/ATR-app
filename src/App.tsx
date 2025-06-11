import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { initSentry } from './lib/sentry';
import { setApiAuthToken } from './lib/aws';

// Import CSS
import './index.css';

// Auth components
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';

// Main components
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchList } from './components/matches/MatchList';
import { ProfileForm } from './components/profile/ProfileForm';
import { TournamentList } from './components/tournaments/TournamentList';

// Initialize Sentry
initSentry();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initialize, session } = useAuthStore();
  
  useEffect(() => {
    initialize();
    
    // Set API auth token when session changes
    if (session?.access_token) {
      setApiAuthToken(session.access_token);
    }
  }, [initialize, session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <MatchList />
          </ProtectedRoute>
        } />
        <Route path="/tournaments" element={
          <ProtectedRoute>
            <TournamentList />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileForm />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;