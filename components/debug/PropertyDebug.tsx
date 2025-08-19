'use client'

import { useState, useEffect } from 'react'
import { PropertyService } from '@/components/property'
import { supabase } from '@/lib/supabase/client'

export default function PropertyDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    debugConnection()
  }, [])

  const debugConnection = async () => {
    const info: any = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }

    try {
      // Test basic Supabase connection
      console.log('🔍 Testing Supabase connection...')
      const { data: healthCheck, error: healthError } = await supabase
        .from('properties')
        .select('count')
        .limit(1)

      info.supabaseConnection = {
        success: !healthError,
        error: healthError?.message,
        data: healthCheck
      }

      // Test PropertyService
      console.log('🔍 Testing PropertyService...')
      try {
        const properties = await PropertyService.getAllProperties()
        info.propertyService = {
          success: true,
          count: properties.length,
          properties: properties.map(p => ({
            id: p.id,
            address: p.address,
            status: p.status,
            price: p.price,
            images: Array.isArray(p.images) ? p.images.length : 'Not array'
          }))
        }
      } catch (serviceError: any) {
        info.propertyService = {
          success: false,
          error: serviceError.message
        }
      }

      // Test raw query
      console.log('🔍 Testing raw Supabase query...')
      const { data: rawData, error: rawError } = await supabase
        .from('properties')
        .select('*')
        .limit(10)

      info.rawQuery = {
        success: !rawError,
        error: rawError?.message,
        count: rawData?.length,
        properties: rawData?.map(p => ({
          id: p.id,
          address: p.address,
          status: p.status,
          created_at: p.created_at
        }))
      }

      // Test with all statuses
      console.log('🔍 Testing all statuses...')
      const { data: allStatusData, error: allStatusError } = await supabase
        .from('properties')
        .select('*')

      info.allStatuses = {
        success: !allStatusError,
        error: allStatusError?.message,
        count: allStatusData?.length,
        statuses: allStatusData?.reduce((acc: any, p: any) => {
          acc[p.status] = (acc[p.status] || 0) + 1
          return acc
        }, {})
      }

    } catch (error: any) {
      info.globalError = error.message
    }

    console.log('🐛 Debug Info:', info)
    setDebugInfo(info)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800">🔍 Debugging connection...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
      <div className="text-lg font-bold mb-4">🐛 Property Debug Info</div>
      
      <div className="space-y-4">
        <div>
          <div className="font-semibold">Environment:</div>
          <div className="pl-4">
            <div>Supabase URL: {debugInfo.environment?.supabaseUrl}</div>
            <div>Has Anon Key: {debugInfo.environment?.hasAnonKey ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div>
          <div className="font-semibold">Supabase Connection:</div>
          <div className="pl-4">
            <div>Success: {debugInfo.supabaseConnection?.success ? '✅' : '❌'}</div>
            {debugInfo.supabaseConnection?.error && (
              <div className="text-red-600">Error: {debugInfo.supabaseConnection.error}</div>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold">PropertyService:</div>
          <div className="pl-4">
            <div>Success: {debugInfo.propertyService?.success ? '✅' : '❌'}</div>
            <div>Count: {debugInfo.propertyService?.count || 0}</div>
            {debugInfo.propertyService?.error && (
              <div className="text-red-600">Error: {debugInfo.propertyService.error}</div>
            )}
            {debugInfo.propertyService?.properties && (
              <div className="mt-2">
                <div className="text-xs">Properties (active only):</div>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(debugInfo.propertyService.properties, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold">Raw Query (all properties):</div>
          <div className="pl-4">
            <div>Success: {debugInfo.rawQuery?.success ? '✅' : '❌'}</div>
            <div>Count: {debugInfo.rawQuery?.count || 0}</div>
            {debugInfo.rawQuery?.error && (
              <div className="text-red-600">Error: {debugInfo.rawQuery.error}</div>
            )}
            {debugInfo.rawQuery?.properties && (
              <div className="mt-2">
                <div className="text-xs">All Properties:</div>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(debugInfo.rawQuery.properties, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold">Status Breakdown:</div>
          <div className="pl-4">
            <div>Success: {debugInfo.allStatuses?.success ? '✅' : '❌'}</div>
            <div>Total Count: {debugInfo.allStatuses?.count || 0}</div>
            {debugInfo.allStatuses?.statuses && (
              <div className="mt-2">
                <div className="text-xs">Status Distribution:</div>
                <pre className="text-xs bg-white p-2 rounded">
                  {JSON.stringify(debugInfo.allStatuses.statuses, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {debugInfo.globalError && (
          <div className="text-red-600">
            <div className="font-semibold">Global Error:</div>
            <div className="pl-4">{debugInfo.globalError}</div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-600">
        Timestamp: {debugInfo.timestamp}
      </div>
    </div>
  )
}