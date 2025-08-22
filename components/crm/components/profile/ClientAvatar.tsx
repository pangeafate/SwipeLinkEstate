import React from 'react'
import type { ClientProfile } from '../../types'

interface ClientAvatarProps {
  profile: ClientProfile
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({ profile }) => (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
  </div>
)