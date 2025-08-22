import React from 'react'

interface MetricCardProps {
  label: string
  value: string
  color: 'blue' | 'green' | 'yellow' | 'red'
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    red: 'bg-red-50 text-red-800 border-red-200'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  )
}