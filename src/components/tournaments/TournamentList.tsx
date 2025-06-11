import React, { useEffect, useState } from 'react'
import { Trophy, Calendar, MapPin, Users, Plus, Search, Filter } from 'lucide-react'
import { useTournamentStore } from '../../stores/tournamentStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface TournamentWithOrganizer extends Tournament {
  organizer?: { username: string }
  participantCount?: number
  isRegistered?: boolean
}

export const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<TournamentWithOrganizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const user = useAuthStore(state => state.user)

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      // Fetch tournaments with organizer info
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          organizer:profiles!tournaments_organizer_id_fkey(username)
        `)
        .order('start_date', { ascending: true })

      if (error) throw error

      // Fetch participant counts for each tournament
      const tournamentsWithCounts = await Promise.all(
        (tournamentsData || []).map(async (tournament) => {
          // Get participant count
          const { count, error: countError } = await supabase
            .from('tournament_participants')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournament.id)

          if (countError) throw countError

          // Check if user is registered
          let isRegistered = false
          if (user) {
            const { data: registration, error: regError } = await supabase
              .from('tournament_participants')
              .select('*')
              .eq('tournament_id', tournament.id)
              .eq('player_id', user.id)
              .maybeSingle()

            if (regError) throw regError
            isRegistered = !!registration
          }

          return {
            ...tournament,
            participantCount: count || 0,
            isRegistered
          }
        })
      )

      setTournaments(tournamentsWithCounts)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tournaments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          fetchTournaments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const filteredTournaments = tournaments.filter(tournament => {
    // Apply search filter
    const matchesSearch = 
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      tournament.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleRegister = async (tournamentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          player_id: user.id
        })

      if (error) throw error

      // Refresh tournaments to update registration status
      fetchTournaments()
    } catch (error: any) {
      console.error('Error registering for tournament:', error)
      alert('Failed to register: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-green-100 text-green-800'
      case 'registration_closed':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <button className="btn btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Create Tournament
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search tournaments..."
          />
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="registration_open">Registration Open</option>
              <option value="registration_closed">Registration Closed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? "No tournaments match your search criteria."
              : "There are no tournaments available at the moment."}
          </p>
          <div className="mt-6">
            <button className="btn btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Create Tournament
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Tournament Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{tournament.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                  {formatStatus(tournament.status)}
                </span>
              </div>

              {/* Tournament Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{tournament.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {tournament.participantCount}/{tournament.max_participants} participants
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Trophy className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="capitalize">{tournament.format.replace('_', ' ')} format</span>
                </div>
              </div>

              {/* Tournament Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tournament.description}
              </p>

              {/* Registration Status */}
              {tournament.isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center text-sm text-green-800 font-medium mb-4">
                  You are registered for this tournament
                </div>
              ) : tournament.status === 'registration_open' && tournament.participantCount < tournament.max_participants ? (
                <button
                  onClick={() => handleRegister(tournament.id)}
                  className="w-full btn btn-primary btn-sm mb-4"
                >
                  Register Now
                </button>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center text-sm text-gray-600 mb-4">
                  {tournament.participantCount >= tournament.max_participants
                    ? 'Tournament is full'
                    : 'Registration closed'}
                </div>
              )}

              {/* View Details Button */}
              <button className="w-full btn btn-secondary btn-sm">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}