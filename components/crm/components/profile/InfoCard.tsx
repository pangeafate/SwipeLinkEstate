import React from 'react'

interface InfoCardProps {
  label: string
  value: string
  icon: string
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <span className="text-xl">{icon}</span>
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
)