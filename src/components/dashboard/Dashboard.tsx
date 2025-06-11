import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Calendar, Users, ChevronRight, Activity, BarChart2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Match = Database['public']['Tables']['matches']['Row'] & {
  player1?: { username: string }
  player2?: { username: string }
}

type Tournament = Database['public']['Tables']['tournaments']['Row']

export const Dashboard: React.FC = () => {
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Fetch recent matches
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            *,
            player1:profiles!matches_player1_id_fkey(username),
            player2:profiles!matches_player2_id_fkey(username)
          `)
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .order('date', { ascending: false })
          .limit(3)

        setRecentMatches(matchesData || [])

        // Fetch upcoming tournaments
        const { data: tournamentsData } = await supabase
          .from('tournaments')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3)

        setUpcomingTournaments(tournamentsData || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.username || 'Player'}!</h1>
        <p className="text-blue-100 mb-6">
          Track your chess journey, join tournaments, and improve your rating.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{profile?.elo_rating || 1200}</div>
            <div className="text-sm text-blue-100">ELO Rating</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{profile?.matches_played || 0}</div>
            <div className="text-sm text-blue-100">Matches Played</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{profile?.matches_won || 0}</div>
            <div className="text-sm text-blue-100">Matches Won</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {profile?.matches_played ? 
                `${Math.round((profile.matches_won / profile.matches_played) * 100)}%` : 
                '0%'}
            </div>
            <div className="text-sm text-blue-100">Win Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Recent Matches
              </h2>
              <Link to="/matches" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent matches</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first match.
                </p>
                <div className="mt-6">
                  <Link to="/matches" className="btn btn-primary">
                    Create Match
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {match.player1?.username} vs {match.player2?.username}
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        match.status === 'completed' ? 'bg-green-100 text-green-800' :
                        match.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {match.status.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {match.location}
                    </div>
                    {match.status === 'completed' && match.score && (
                      <div className="mt-2 text-sm font-medium">
                        Score: <span className="text-blue-600">{match.score}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Tournaments
              </h2>
              <Link to="/tournaments" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {upcomingTournaments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming tournaments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Check back later for new tournaments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-2">{tournament.name}</div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tournament.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Max Participants: {tournament.max_participants}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating Trend */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Rating Trend
              </h2>
            </div>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Rating history visualization will be available soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}