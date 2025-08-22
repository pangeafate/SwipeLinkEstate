import React from 'react'

interface InsightsTabProps {
  insightsData: {
    insights: string[]
    recommendations: string[]
    nextActions: string[]
  }
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ insightsData }) => (
  <div className="space-y-6">
    {/* AI Insights */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🧠</span>
        AI-Generated Insights
      </h3>
      <div className="space-y-2">
        {insightsData.insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600 mt-0.5">💡</span>
            <p className="text-gray-800">{insight}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🎯</span>
        Recommendations
      </h3>
      <div className="space-y-2">
        {insightsData.recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600 mt-0.5">✅</span>
            <p className="text-gray-800">{rec}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Next Actions */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🚀</span>
        Next Actions
      </h3>
      <div className="space-y-2">
        {insightsData.nextActions.map((action, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
            <span className="text-orange-600 mt-0.5">📋</span>
            <p className="text-gray-800">{action}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)