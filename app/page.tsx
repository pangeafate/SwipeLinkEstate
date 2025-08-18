import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SwipeLink Estate
            </h1>
            <p className="text-gray-600">
              Discover your dream property with a simple swipe
            </p>
          </div>
          
          <div className="space-y-4">
            <Link href="/dashboard" className="btn-primary w-full block text-center">
              Agent Dashboard
            </Link>
            
            <Link href="/properties" className="btn-secondary w-full block text-center">
              Browse Properties
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Have a link? Enter the code above or click the link to start swiping!
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-primary-600 font-medium">
            🏠 Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </main>
  )
}