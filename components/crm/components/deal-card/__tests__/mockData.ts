import type { Deal } from '../../../types'

export const mockDeal: Deal = {
  id: 'deal-1',
  linkId: 'link-123',
  agentId: 'agent-456',
  dealName: 'Downtown Condo Deal',
  dealStatus: 'active',
  dealStage: 'qualified',
  dealValue: 150000,
  clientId: 'client-789',
  clientName: 'John Doe',
  clientEmail: 'john.doe@example.com',
  clientPhone: '+1-555-0123',
  clientTemperature: 'hot',
  propertyIds: ['prop-1', 'prop-2', 'prop-3'],
  propertyCount: 3,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  engagementScore: 85,
  sessionCount: 12,
  totalTimeSpent: 3600,
  nextFollowUp: '2024-01-25T09:00:00Z',
  notes: 'Highly engaged client, ready to close soon',
  tags: ['VIP', 'Hot Lead', 'Luxury', 'Referral']
}

export const mockDealCold: Deal = {
  id: 'deal-2',
  linkId: 'link-456',
  agentId: 'agent-456',
  dealName: 'Suburban House Deal',
  dealStatus: 'nurturing',
  dealStage: 'engaged',
  dealValue: 75000,
  clientId: 'client-012',
  clientName: 'Jane Smith',
  clientEmail: 'jane.smith@example.com',
  clientPhone: '+1-555-0456',
  clientTemperature: 'cold',
  propertyIds: ['prop-4'],
  propertyCount: 1,
  createdAt: '2024-01-10T14:00:00Z',
  updatedAt: '2024-01-18T11:20:00Z',
  lastActivityAt: '2024-01-18T11:20:00Z',
  engagementScore: 35,
  sessionCount: 3,
  totalTimeSpent: 900,
  nextFollowUp: '2024-02-01T10:00:00Z',
  notes: 'Needs more nurturing, not ready yet',
  tags: ['First Time Buyer']
}

export const mockDealWarm: Deal = {
  id: 'deal-3',
  linkId: 'link-789',
  agentId: 'agent-456',
  dealName: 'Beachfront Property',
  dealStatus: 'qualified',
  dealStage: 'advanced',
  dealValue: 250000,
  clientId: 'client-345',
  clientName: 'Mike Johnson',
  clientEmail: 'mike.johnson@example.com',
  clientPhone: '+1-555-0789',
  clientTemperature: 'warm',
  propertyIds: ['prop-5', 'prop-6'],
  propertyCount: 2,
  createdAt: '2024-01-12T09:30:00Z',
  updatedAt: '2024-01-19T16:45:00Z',
  lastActivityAt: '2024-01-19T16:45:00Z',
  engagementScore: 67,
  sessionCount: 8,
  totalTimeSpent: 2400,
  nextFollowUp: '2024-01-28T14:00:00Z',
  notes: 'Interested in beachfront properties, good potential',
  tags: ['Investment', 'Repeat Client']
}

export const mockDealClosed: Deal = {
  id: 'deal-4',
  linkId: 'link-012',
  agentId: 'agent-456',
  dealName: 'City Apartment Deal',
  dealStatus: 'closed-won',
  dealStage: 'closed',
  dealValue: 120000,
  clientId: 'client-678',
  clientName: 'Sarah Wilson',
  clientEmail: 'sarah.wilson@example.com',
  clientPhone: '+1-555-0012',
  clientTemperature: 'hot',
  propertyIds: ['prop-7'],
  propertyCount: 1,
  createdAt: '2024-01-05T13:15:00Z',
  updatedAt: '2024-01-22T12:00:00Z',
  lastActivityAt: '2024-01-22T12:00:00Z',
  engagementScore: 95,
  sessionCount: 15,
  totalTimeSpent: 4500,
  nextFollowUp: null,
  notes: 'Deal closed successfully, very satisfied client',
  tags: ['Closed Deal', 'Success Story']
}

export const mockDealMinimal: Deal = {
  id: 'deal-5',
  linkId: 'link-345',
  agentId: 'agent-456',
  dealName: 'Basic Deal',
  dealStatus: 'active',
  dealStage: 'created',
  dealValue: null,
  clientId: null,
  clientName: null,
  clientEmail: null,
  clientPhone: null,
  clientTemperature: 'cold',
  propertyIds: [],
  propertyCount: 0,
  createdAt: '2024-01-20T08:00:00Z',
  updatedAt: '2024-01-20T08:00:00Z',
  lastActivityAt: null,
  engagementScore: 15,
  sessionCount: 1,
  totalTimeSpent: 120,
  nextFollowUp: null,
  notes: null,
  tags: []
}

export const mockDeals: Deal[] = [
  mockDeal,
  mockDealCold,
  mockDealWarm,
  mockDealClosed,
  mockDealMinimal
]