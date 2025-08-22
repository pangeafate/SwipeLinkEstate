'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AgentNavigation() {
  const pathname = usePathname()

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Links', href: '/links' },
    { name: 'CRM', href: '/crm' },
    { name: 'Analytics', href: '/analytics' }
  ]

  const isActive = (href: string) => {
    // Check for exact match or if current path starts with the href (for sub-routes)
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav aria-label="Agent navigation" className="border-b border-gray-200">
      <div className="flex space-x-0">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            tabIndex={0}
            className={`px-4 py-2 text-sm font-medium hover:text-blue-600 transition-colors ${
              isActive(item.href)
                ? 'text-gray-900 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}