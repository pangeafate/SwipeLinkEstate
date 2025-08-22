import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar,
  BarChart3,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Home
} from 'lucide-react'

interface Task {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

interface Deal {
  id: string
  clientName: string
  dealName: string
  engagementScore: number
}

interface CRMSidebarProps {
  currentPath: string
  upcomingTasks?: Task[]
  hotLeads?: Deal[]
  onNavigate?: (path: string) => void
  onAddDeal?: () => void
  onAddContact?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/crm', icon: LayoutDashboard },
  { id: 'deals', label: 'Current Deals', path: '/links', icon: Briefcase },
  { id: 'properties', label: 'Properties', path: '/dashboard', icon: Home },
  { id: 'contacts', label: 'Contacts', path: '/crm/contacts', icon: Users },
  { id: 'activities', label: 'Activities', path: '/crm/activities', icon: Calendar },
  { id: 'reports', label: 'Reports', path: '/crm/reports', icon: BarChart3 },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-red-500 bg-red-50'
    case 'medium': return 'border-yellow-500 bg-yellow-50'
    case 'low': return 'border-gray-300 bg-gray-50'
    default: return 'border-gray-300 bg-gray-50'
  }
}

const CRMSidebar: React.FC<CRMSidebarProps> = ({
  currentPath,
  upcomingTasks = [],
  hotLeads = [],
  onNavigate,
  onAddDeal,
  onAddContact,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const router = useRouter()

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      router.push(path)
    }
  }

  const displayedTasks = upcomingTasks.slice(0, 5)
  const displayedLeads = hotLeads.slice(0, 3)

  return (
    <aside
      data-testid="crm-sidebar"
      aria-expanded={!isCollapsed}
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200
        transition-all duration-300 z-40
        hidden lg:block
        ${isCollapsed ? 'w-[60px]' : 'w-[280px]'}
      `}
      style={{ width: isCollapsed ? '60px' : '280px' }}
    >
      <div className="flex flex-col h-full">
        {/* Header with Collapse Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">CRM</h2>
          )}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ overflowY: 'auto' }}>
          {/* Navigation */}
          <nav aria-label="CRM Navigation" className="p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                // Check if current path matches the navigation item path
                // Handle both exact matches and path prefixes for nested routes
                const isActive = currentPath === item.path || 
                  (item.path === '/links' && currentPath.startsWith('/links')) ||
                  (item.path === '/dashboard' && currentPath.startsWith('/dashboard'))
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    aria-label={item.label}
                    className={`
                      w-full flex items-center px-3 py-2 rounded-lg
                      transition-colors group
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon 
                      data-testid={`icon-${item.id}`}
                      className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {!isCollapsed && (
            <>
              {/* Quick Actions */}
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <button
                    onClick={onAddDeal}
                    aria-label="Add Deal"
                    className="w-full flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="ml-2 text-sm font-medium">Add Deal</span>
                  </button>
                  <button
                    onClick={onAddContact}
                    aria-label="Add Contact"
                    className="w-full flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="ml-2 text-sm font-medium">Add Contact</span>
                  </button>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <section aria-label="Upcoming Tasks" className="px-4 pb-4">
                <div className="flex items-center mb-3">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h3>
                </div>
                <div className="space-y-2">
                  {displayedTasks.length > 0 ? (
                    <>
                      {displayedTasks.map((task) => (
                        <div
                          key={task.id}
                          data-testid={`task-${task.id}`}
                          className={`
                            p-2 rounded-lg border-l-2 cursor-pointer
                            hover:shadow-sm transition-shadow
                            ${getPriorityColor(task.priority)}
                          `}
                        >
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(task.dueDate)}
                          </p>
                        </div>
                      ))}
                      {upcomingTasks.length > 5 && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          View all tasks
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">No upcoming tasks</p>
                  )}
                </div>
              </section>

              {/* Hot Leads */}
              <section aria-label="Hot Leads" className="px-4 pb-4">
                <div className="flex items-center mb-3">
                  <Flame className="w-4 h-4 text-red-500 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900">🔥 Hot Leads</h3>
                </div>
                <div className="space-y-2">
                  {displayedLeads.length > 0 ? (
                    displayedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        data-testid={`lead-${lead.id}`}
                        className="p-2 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {lead.clientName}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {lead.dealName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Score: {lead.engagementScore}/100
                            </p>
                          </div>
                          <button className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                            Contact
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No hot leads at the moment</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

export default CRMSidebar