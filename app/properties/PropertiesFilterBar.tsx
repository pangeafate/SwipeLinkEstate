/**
 * Properties Filter Bar Component
 * Handles property filtering UI
 */

interface PropertiesFilterBarProps {
  onFilterApply?: () => void
}

export function PropertiesFilterBar({ onFilterApply }: PropertiesFilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <select className="input">
          <option>All Types</option>
          <option>Apartment</option>
          <option>House</option>
          <option>Condo</option>
        </select>
        <select className="input">
          <option>Any Price</option>
          <option>Under $500k</option>
          <option>$500k - $1M</option>
          <option>$1M - $2M</option>
          <option>Over $2M</option>
        </select>
        <select className="input">
          <option>Any Beds</option>
          <option>1+ bed</option>
          <option>2+ beds</option>
          <option>3+ beds</option>
          <option>4+ beds</option>
        </select>
        <button 
          className="btn-primary"
          onClick={onFilterApply}
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}