import React from 'react'
import type { ClientProfile } from '../../../types'

interface PreferencesTabProps {
  profile: ClientProfile
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({ profile }) => (
  <div className="space-y-6">
    {/* Property Types */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Property Types</h3>
      {profile.preferredPropertyTypes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.preferredPropertyTypes.map(type => (
            <span key={type} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg">
              {type}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No property type preferences identified yet</p>
      )}
    </div>

    {/* Price Range */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        {profile.priceRange.min || profile.priceRange.max ? (
          <p className="text-lg font-medium">
            ${profile.priceRange.min?.toLocaleString() || '0'} - ${profile.priceRange.max?.toLocaleString() || '∞'}
          </p>
        ) : (
          <p className="text-gray-500">Price range not determined yet</p>
        )}
      </div>
    </div>

    {/* Features */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Features</h3>
      {profile.preferredFeatures.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {profile.preferredFeatures.map(feature => (
            <div key={feature} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-blue-600">✓</span>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No feature preferences identified yet</p>
      )}
    </div>

    {/* Location Preferences */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Preferences</h3>
      {profile.preferredLocations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.preferredLocations.map(location => (
            <span key={location} className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
              📍 {location}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No location preferences identified yet</p>
      )}
    </div>
  </div>
)