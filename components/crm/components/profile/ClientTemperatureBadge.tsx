import React from 'react'
import type { ClientTemperature } from '../../types'

interface ClientTemperatureBadgeProps {
  temperature: ClientTemperature
  large?: boolean
}

export const ClientTemperatureBadge: React.FC<ClientTemperatureBadgeProps> = ({ 
  temperature, 
  large = false 
}) => {
  const colors = {
    hot: 'bg-red-100 text-red-800 border-red-200',
    warm: 'bg-orange-100 text-orange-800 border-orange-200',
    cold: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  const icons = { hot: '🔥', warm: '⚡', cold: '❄️' }
  
  return (
    <span className={`
      inline-flex items-center space-x-1 border rounded-full font-medium
      ${colors[temperature]}
      ${large ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'}
    `}>
      <span>{icons[temperature]}</span>
      <span>{temperature.toUpperCase()}</span>
    </span>
  )
}