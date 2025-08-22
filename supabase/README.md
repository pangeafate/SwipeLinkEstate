# SwipeLink Estate CRM Database Operations

This directory contains all database-related operations for the SwipeLink Estate CRM system, following database administrator best practices for operational excellence and reliability.

## 📁 Directory Structure

```
supabase/
├── migrations/                    # Database migration files
│   ├── 20250821_001_crm_foundation.sql       # Core CRM schema
│   └── 20250821_001_crm_foundation_rollback.sql  # Rollback script
├── seed/                         # Development seed data
│   └── crm_development_seed.sql  # Comprehensive test data
└── README.md                     # This file
```

## 🚀 Quick Start

### Development Setup (Complete CRM Database)

```bash
# Apply CRM migration + seed data + run tests
npm run db:setup:dev

# OR step by step:
npm run db:migrate:crm        # Apply CRM schema
npm run db:seed:crm          # Load development data
npm run db:test:crm          # Verify everything works
```

### Production Deployment

```bash
# Check migration status
npm run db:migrate:crm:status

# Apply migration (production safe)
npm run db:migrate:crm

# Verify migration integrity  
npm run db:migrate:crm:verify
```

## 📊 Database Schema Overview

### Core CRM Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `clients` | Progressive client profiling | Behavioral data, engagement scoring, temperature classification |
| `tasks` | Automated & manual task management | Priority-based, automation triggers, completion tracking |
| `engagement_sessions` | Session-level tracking | Completion rates, interaction metrics, device info |
| `links` (extended) | Deals pipeline | 7-stage workflow, engagement scoring, probability tracking |
| `activities` (enhanced) | Granular interaction tracking | Engagement values, session duration, client behavior |

### Custom Types (Enums)

- `deal_status`: active, qualified, nurturing, closed-won, closed-lost
- `deal_stage`: created, shared, accessed, engaged, qualified, advanced, closed  
- `client_temperature`: hot (80-100), warm (50-79), cold (0-49)
- `task_type`: call, email, showing, follow-up, meeting, document
- `task_priority`: high, medium, low
- `task_status`: pending, completed, dismissed, overdue

## 🛠️ Available Commands

### Migration Commands

```bash
# Apply CRM foundation migration
npm run db:migrate:crm

# Check migration status  
npm run db:migrate:crm:status

# Verify migration integrity
npm run db:migrate:crm:verify

# Rollback migration (⚠️ DESTRUCTIVE - deletes all CRM data)
npm run db:migrate:crm:rollback
```

### Seed Data Commands

```bash
# Load development seed data
npm run db:seed:crm
```

### Testing Commands

```bash
# Run all CRM database tests
npm run db:test:crm

# Test migration/schema only
npm run db:test:crm:migrate

# Test seed data only
npm run db:test:crm:seed

# Test performance benchmarks only
npm run db:test:crm:perf
```

### Utility Commands

```bash
# Complete development reset
npm run db:reset:dev

# Development setup from scratch
npm run db:setup:dev
```

## 📈 Performance Benchmarks

The CRM schema is optimized for high performance with comprehensive indexing:

### Index Strategy

- **Selective indexes**: Only on columns with high cardinality and frequent queries
- **Partial indexes**: Using WHERE clauses to reduce index size
- **Composite indexes**: For common query patterns
- **Foreign key indexes**: For all relationship columns

### Performance Targets

| Query Type | Target | Monitoring |
|------------|--------|------------|
| Simple lookups | < 50ms | Automatic |
| Complex joins | < 200ms | Automatic |
| Engagement scoring | < 500ms | Automatic |
| Bulk operations | < 2s | Manual |

### Query Optimization

```sql
-- Optimized client lookup by temperature
SELECT * FROM clients WHERE temperature = 'hot' AND is_active = true;

-- Optimized deal pipeline query  
SELECT * FROM links WHERE deal_status = 'active' AND engagement_score > 50;

-- Optimized task queue query
SELECT * FROM tasks WHERE status = 'pending' AND due_date <= NOW() ORDER BY priority, due_date;
```

## 🔒 Security & Access Control

### Row Level Security (RLS)

- **Enabled** on all CRM tables
- **Public access** during development (will be restricted when auth is implemented)
- **Policy-based** access control ready for multi-tenant architecture

### Data Protection

- **Foreign key constraints** prevent orphaned records
- **Check constraints** enforce data integrity
- **Enum types** prevent invalid values
- **NOT NULL constraints** on critical fields

## 🚨 Backup & Disaster Recovery

### Backup Strategy

1. **Automated Daily Backups**: Supabase managed
2. **Point-in-Time Recovery**: Available for last 7 days
3. **Schema Migrations**: Version controlled and reversible
4. **Seed Data**: Reproducible test environments

### Recovery Procedures

#### Schema Corruption
```bash
# Step 1: Assess damage
npm run db:migrate:crm:verify

# Step 2: Rollback if needed
npm run db:migrate:crm:rollback

# Step 3: Reapply clean schema
npm run db:migrate:crm

# Step 4: Verify integrity
npm run db:test:crm
```

#### Data Corruption
```bash
# Step 1: Stop application to prevent further damage
# Step 2: Use Supabase point-in-time recovery
# Step 3: Verify data integrity with test suite
npm run db:test:crm:seed
```

## 📊 Monitoring & Alerting

### Key Metrics to Monitor

1. **Query Performance**
   - Average response times
   - Slow query identification (>100ms)
   - Connection pool utilization

2. **Data Growth**
   - Table sizes and growth rates  
   - Index efficiency
   - Storage utilization

3. **Business Metrics**
   - Deal progression rates
   - Engagement score distributions
   - Task completion rates

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Query Response Time | >100ms | >500ms |
| Connection Pool | >80% | >95% |
| Storage Growth | >10GB/week | >20GB/week |
| Failed Queries | >1% | >5% |

## 🧪 Testing Strategy

### Automated Test Suite

The CRM schema includes a comprehensive test suite covering:

- **Schema Structure**: Tables, columns, indexes, constraints
- **Data Integrity**: Foreign keys, check constraints, triggers  
- **Performance**: Query timing, index efficiency
- **Business Logic**: Engagement scoring, temperature classification
- **Seed Data**: Relationship integrity, realistic scenarios

### Test Data Scenarios

The seed data includes realistic scenarios for:

1. **Hot Lead** (Sarah Johnson): High engagement, multiple sessions
2. **Warm Lead** (Michael Chen): Moderate engagement, professional buyer
3. **Cold Lead** (Emily Rodriguez): Low engagement, first-time buyer  
4. **Investment Client** (David Williams): Research-heavy, multiple properties
5. **Anonymous User**: Progressive profiling needed

## 🔧 Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly
```bash
# Check for slow queries
npm run db:test:crm:perf

# Verify data integrity
npm run db:test:crm
```

#### Monthly  
```bash
# Analyze table statistics
# Update index usage statistics
# Review query performance logs
```

#### Quarterly
```bash
# Review and optimize indexes
# Archive old engagement sessions (>6 months)
# Update performance benchmarks
```

### Optimization Queries

```sql
-- Find unused indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'links', 'tasks', 'activities');

-- Check index usage
SELECT indexrelname, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';

-- Table size analysis
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run full test suite: `npm run db:test:crm`
- [ ] Verify migration integrity: `npm run db:migrate:crm:verify`
- [ ] Check performance benchmarks: `npm run db:test:crm:perf`
- [ ] Backup current database state
- [ ] Verify rollback procedures work

### Deployment

- [ ] Apply migration: `npm run db:migrate:crm`
- [ ] Verify application: `npm run db:migrate:crm:verify`
- [ ] Run smoke tests: `npm run db:test:crm:migrate`
- [ ] Monitor performance for 24 hours
- [ ] Update monitoring dashboards

### Post-Deployment

- [ ] Verify all application features work
- [ ] Check API response times < 100ms
- [ ] Monitor error logs for 48 hours
- [ ] Update documentation if needed
- [ ] Train team on new features

## 📞 Support & Troubleshooting

### Common Issues

#### Migration Fails
```bash
# Check migration status
npm run db:migrate:crm:status

# Look for detailed error logs in migration output
# Usually caused by data conflicts or permission issues
```

#### Performance Issues
```bash
# Run performance benchmarks
npm run db:test:crm:perf

# Check for missing indexes or outdated statistics
```

#### Data Inconsistencies  
```bash
# Run full integrity tests
npm run db:test:crm

# Check foreign key violations or constraint issues
```

### Emergency Procedures

#### Complete System Failure
1. Assess scope of failure
2. Stop application to prevent data corruption
3. Use Supabase point-in-time recovery
4. Verify recovery with test suite
5. Gradually restart services

#### Schema Corruption
1. Run diagnostic tests: `npm run db:test:crm`
2. If critical: `npm run db:migrate:crm:rollback`
3. Reapply schema: `npm run db:migrate:crm`
4. Reload seed data if needed: `npm run db:seed:crm`

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

---

**Last Updated**: 2025-08-21  
**Migration Version**: 20250821_001_crm_foundation  
**Maintained By**: Database Administrator Team