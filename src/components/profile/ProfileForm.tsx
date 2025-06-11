import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Camera, Save, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

type ProfileFormData = z.infer<typeof profileSchema>

export const ProfileForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const profile = useAuthStore(state => state.profile)
  const updateProfile = useAuthStore(state => state.updateProfile)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      bio: profile?.bio || '',
      skill_level: profile?.skill_level || 'beginner',
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    
    try {
      await updateProfile(data)
      setSuccessMessage('Profile updated successfully')
      reset(data) // Reset form with new values
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setIsUploading(true)
    setErrorMessage(null)
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.user_id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `profile-pictures/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new picture URL
      await updateProfile({ profile_picture_url: publicUrl })
      setSuccessMessage('Profile picture updated successfully')
    } catch (err: any) {
      setErrorMessage('Error uploading profile picture: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl font-bold border-2 border-gray-200">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-5 w-5" />
            </label>
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
              disabled={isUploading}
            />
          </div>
          {isUploading && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading...
            </div>
          )}
        </div>

        {/* Profile Stats */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">ELO Rating</div>
              <div className="text-2xl font-bold text-gray-900">{profile.elo_rating}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Matches Played</div>
              <div className="text-2xl font-bold text-gray-900">{profile.matches_played}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Matches Won</div>
              <div className="text-2xl font-bold text-gray-900">{profile.matches_won}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {profile.matches_played > 0
                  ? `${Math.round((profile.matches_won / profile.matches_played) * 100)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Username
          </label>
          <input
            {...register('username')}
            type="text"
            id="username"
            className="form-input"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        {/* Skill Level */}
        <div>
          <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700 mb-2">
            Skill Level
          </label>
          <select
            {...register('skill_level')}
            id="skill_level"
            className="form-input"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          {errors.skill_level && (
            <p className="mt-1 text-sm text-red-600">{errors.skill_level.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={4}
            className="form-input"
            placeholder="Tell others about yourself..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {(profile.bio?.length || 0)}/200 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 btn btn-secondary"
            disabled={isSubmitting || !isDirty}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}