import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, MapPin, Users, Search, Clock } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const createMatchSchema = z.object({
  opponentId: z.string().min(1, 'Please select an opponent'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  tournamentId: z.string().optional()
})

type CreateMatchFormData = z.infer<typeof createMatchSchema>

interface CreateMatchModalProps {
  onClose: () => void
  onMatchCreated: () => void
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  onClose,
  onMatchCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [players, setPlayers] = useState<Profile[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<Profile | null>(null)
  const [showPlayerSearch, setShowPlayerSearch] = useState(true)
  
  const user = useAuthStore(state => state.user)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CreateMatchFormData>({
    resolver: zodResolver(createMatchSchema)
  })

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .order('elo_rating', { ascending: false })

        if (error) throw error
        setPlayers(data || [])
      } catch (error) {
        console.error('Error fetching players:', error)
      }
    }

    fetchPlayers()
  }, [user])

  const filteredPlayers = players.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayerSelect = (player: Profile) => {
    setSelectedOpponent(player)
    setValue('opponentId', player.user_id)
    setShowPlayerSearch(false)
  }

  const onSubmit = async (data: CreateMatchFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const matchDateTime = new Date(`${data.date}T${data.time}`)

      const { error } = await supabase
        .from('matches')
        .insert({
          player1_id: user.id,
          player2_id: data.opponentId,
          date: matchDateTime.toISOString(),
          location: data.location,
          tournament_id: data.tournamentId || null,
          status: 'pending'
        })

      if (error) throw error

      onMatchCreated()
    } catch (error: any) {
      console.error('Error creating match:', error)
      alert('Failed to create match: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set default date and time
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]
  const defaultTime = '18:00'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-2 h-6 w-6 text-blue-500" />
              Create New Match
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Opponent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Opponent
              </label>
              
              {selectedOpponent ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedOpponent.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{selectedOpponent.username}</div>
                      <div className="text-sm text-gray-500">
                        Rating: {selectedOpponent.elo_rating} • {selectedOpponent.skill_level}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOpponent(null)
                      setShowPlayerSearch(true)
                      setValue('opponentId', '')
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search players by username..."
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredPlayers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No players found
                      </div>
                    ) : (
                      filteredPlayers.map((player) => (
                        <button
                          key={player.user_id}
                          type="button"
                          onClick={() => handlePlayerSelect(player)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{player.username}</div>
                              <div className="text-sm text-gray-500">
                                Rating: {player.elo_rating} • {player.skill_level}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              {errors.opponentId && (
                <p className="mt-1 text-sm text-red-600">{errors.opponentId.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  id="date"
                  defaultValue={defaultDate}
                  min={defaultDate}
                  className="form-input"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time
                </label>
                <input
                  {...register('time')}
                  type="time"
                  id="time"
                  defaultValue={defaultTime}
                  className="form-input"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                className="form-input"
                placeholder="e.g., City Chess Club, 123 Main St"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Match'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}