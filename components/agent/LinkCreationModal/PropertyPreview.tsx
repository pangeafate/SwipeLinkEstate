/**
 * Property Preview Component
 * Shows selected properties in the link creation modal
 */

interface PropertyPreviewProps {
  selectedProperties: Array<{
    id: string
    address: string
    price: number | null
    bedrooms: number | null
    bathrooms: number | null
  }>
}

export function PropertyPreview({ selectedProperties }: PropertyPreviewProps) {
  return (
    <div data-testid="selected-properties-preview" className="bg-blue-50 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">Selected Properties</h3>
      <div className="text-sm text-blue-800 mb-3">
        {selectedProperties.length} {selectedProperties.length === 1 ? 'property' : 'properties'} selected
      </div>
      <div className="space-y-2">
        {selectedProperties.map(property => (
          <div key={property.id} data-testid={`selected-property-${property.id}`} className="flex items-center space-x-3 bg-white rounded-md p-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{property.address}</div>
              <div className="text-sm text-gray-500">
                ${property.price?.toLocaleString() || 'Price on request'} • {property.bedrooms}bd, {property.bathrooms}ba
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}