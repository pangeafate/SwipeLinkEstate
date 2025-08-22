import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Property, PropertyUpdate } from '@/lib/supabase/types'

interface PropertiesState {
  // State
  properties: Property[]
  selectedProperties: string[]
  isLoading: boolean
  error: string | null

  // Actions
  setProperties: (properties: Property[]) => void
  addProperty: (property: Property) => void
  updateProperty: (id: string, updates: PropertyUpdate) => void
  removeProperty: (id: string) => void
  
  // Selection management
  togglePropertySelection: (id: string) => void
  clearSelection: () => void
  setSelectedProperties: (ids: string[]) => void
  
  // Loading and error states
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Utilities
  getPropertyById: (id: string) => Property | undefined
  getSelectedPropertiesData: () => Property[]
  
  // Reset
  reset: () => void
}

const initialState = {
  properties: [],
  selectedProperties: [],
  isLoading: false,
  error: null,
}

export const usePropertiesStore = create<PropertiesState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Set all properties (typically from API fetch)
      setProperties: (properties) =>
        set({ properties }, false, 'setProperties'),

      // Add a single property (for optimistic updates)
      addProperty: (property) =>
        set(
          (state) => ({
            properties: [...state.properties, property],
          }),
          false,
          'addProperty'
        ),

      // Update existing property
      updateProperty: (id, updates) =>
        set(
          (state) => ({
            properties: state.properties.map((property) =>
              property.id === id
                ? { ...property, ...updates, updated_at: new Date().toISOString() }
                : property
            ),
          }),
          false,
          'updateProperty'
        ),

      // Remove property
      removeProperty: (id) =>
        set(
          (state) => ({
            properties: state.properties.filter((property) => property.id !== id),
            selectedProperties: state.selectedProperties.filter((propId) => propId !== id),
          }),
          false,
          'removeProperty'
        ),

      // Toggle property selection
      togglePropertySelection: (id) =>
        set(
          (state) => ({
            selectedProperties: state.selectedProperties.includes(id)
              ? state.selectedProperties.filter((propId) => propId !== id)
              : [...state.selectedProperties, id],
          }),
          false,
          'togglePropertySelection'
        ),

      // Clear all selections
      clearSelection: () =>
        set({ selectedProperties: [] }, false, 'clearSelection'),

      // Set selected properties directly
      setSelectedProperties: (ids) =>
        set({ selectedProperties: ids }, false, 'setSelectedProperties'),

      // Set loading state
      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'setLoading'),

      // Set error state
      setError: (error) =>
        set({ error }, false, 'setError'),

      // Get property by ID
      getPropertyById: (id) => {
        const { properties } = get()
        return properties.find((property) => property.id === id)
      },

      // Get selected properties data
      getSelectedPropertiesData: () => {
        const { properties, selectedProperties } = get()
        return properties.filter((property) => selectedProperties.includes(property.id))
      },

      // Reset store to initial state
      reset: () =>
        set(initialState, false, 'reset'),
    }),
    {
      name: 'properties-store',
    }
  )
)