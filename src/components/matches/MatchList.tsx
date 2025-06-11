import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, Trophy, Clock, Users, Plus } from 'lucide-react'
import { useMatchStore } from '../../stores/matchStore'
import { useAuthStore } from '../../stores/authStore'
import { MatchScoring } from './MatchScoring'
import { CreateMatchModal } from './CreateMatchModal'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Match = Database['public']['Tables']['matches']['Row']

interface MatchWithProfiles extends Match {
  player1?: { username: string; elo_rating: number }
  player2?: { username: string; elo_rating: number }
  winner?: { username: string }
}

export const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<MatchWithProfiles[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  
  const user = useAuthStore(state => state.user)

  const fetchMatches = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          player1:profiles!matches_player1_id_fkey(username, elo_rating),
          player2:profiles!matches_player2_id_fkey(username, elo_rating),
          winner:profiles!matches_winner_id_fkey(username)
        `)
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('date', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()

    // Subscribe to real-time updates
    if (user) {
      const subscription = supabase
        .channel('matches')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `or(player1_id.eq.${user.id},player2_id.eq.${user.id})`
          },
          () => {
            fetchMatches()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const filteredMatches = matches.filter(match => {
    if (filter === 'upcoming') {
      return match.status === 'pending' || match.status === 'in_progress'
    }
    if (filter === 'completed') {
      return match.status === 'completed'
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canScoreMatch = (match: Match) => {
    return user && (match.player1_id === user.id || match.player2_id === user.id) && 
           (match.status === 'pending' || match.status === 'in_progress')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Match
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Matches' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You haven't played any matches yet."
              : `No ${filter} matches found.`
            }
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Match
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Match Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {match.player1?.username} vs {match.player2?.username}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                  {match.status.replace('_', ' ')}
                </span>
              </div>

              {/* Match Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(match.date).toLocaleDateString()} at{' '}
                  {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {match.location}
                </div>
              </div>

              {/* Score Display */}
              {match.status === 'completed' && match.score && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{match.score}</div>
                    {match.winner && (
                      <div className="text-sm text-green-600 font-medium">
                        Winner: {match.winner.username}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {canScoreMatch(match) && (
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="flex-1 btn btn-primary btn-sm"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {match.status === 'pending' ? 'Start Match' : 'Update Score'}
                  </button>
                )}
                <button className="flex-1 btn btn-secondary btn-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Scoring Modal */}
      {selectedMatch && (
        <MatchScoring
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onScoreSubmitted={() => {
            fetchMatches()
            setSelectedMatch(null)
          }}
        />
      )}

      {/* Create Match Modal */}
      {showCreateModal && (
        <CreateMatchModal
          onClose={() => setShowCreateModal(false)}
          onMatchCreated={() => {
            fetchMatches()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}