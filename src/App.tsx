import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import { LoginForm } from './components/auth/LoginForm'
import { SignUpForm } from './components/auth/SignUpForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { MatchList } from './components/matches/MatchList'
import { ProfileForm } from './components/profile/ProfileForm'
import { TournamentList } from './components/tournaments/TournamentList'
import { User, LogOut, Home, Trophy, Activity, Settings } from 'lucide-react'
import './index.css'

// Initialize Sentry
initSentry()

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore(state => state.user)
  const loading = useAuthStore(state => state.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore(state => state.user)
  const loading = useAuthStore(state => state.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const profile = useAuthStore(state => state.profile)
  const signOut = useAuthStore(state => state.signOut)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md fixed inset-y-0 left-0 z-10 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <Trophy className="mr-2 h-6 w-6 text-blue-600" />
              Chess Platform
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              to="/matches"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
            >
              <Activity className="h-5 w-5 mr-3" />
              Matches
            </Link>
            <Link
              to="/tournaments"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
            >
              <Trophy className="h-5 w-5 mr-3" />
              Tournaments
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
            >
              <Settings className="h-5 w-5 mr-3" />
              Profile
            </Link>
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">{profile?.username}</div>
                <div className="text-sm text-gray-500">Rating: {profile?.elo_rating}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-blue-600" />
            Chess Platform
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex border-t">
          <Link
            to="/dashboard"
            className="flex-1 py-3 text-center text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Home className="h-5 w-5 mx-auto" />
            <span className="text-xs mt-1 block">Home</span>
          </Link>
          <Link
            to="/matches"
            className="flex-1 py-3 text-center text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Activity className="h-5 w-5 mx-auto" />
            <span className="text-xs mt-1 block">Matches</span>
          </Link>
          <Link
            to="/tournaments"
            className="flex-1 py-3 text-center text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Trophy className="h-5 w-5 mx-auto" />
            <span className="text-xs mt-1 block">Tournaments</span>
          </Link>
          <Link
            to="/profile"
            className="flex-1 py-3 text-center text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <User className="h-5 w-5 mx-auto" />
            <span className="text-xs mt-1 block">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <SentryErrorBoundary fallback={({ error }) => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                  <LoginForm />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                  <SignUpForm />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MatchList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TournamentList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfileForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </SentryErrorBoundary>
  )
}

export default App