# OPINIKU.ID News Portal Database System

## Overview

This is a comprehensive database system for OPINIKU.ID, a modern news portal with content management system (CMS) and approval workflow capabilities. The system is built on PostgreSQL (via Supabase) and includes all necessary components for a production-ready news website.

## Database Management System

**PostgreSQL (via Supabase)** - Selected for:
- Advanced JSON support for flexible content storage
- Full-text search capabilities for article search
- Row Level Security (RLS) for fine-grained access control
- Excellent performance with proper indexing
- ACID compliance ensuring data integrity
- Real-time subscriptions for live updates

## Database Architecture

### Core Tables

1. **profiles** - Extended user information and role management
2. **categories** - News categories (Politik, Ekonomi, Olahraga, etc.)
3. **tags** - Article tagging system for better organization
4. **articles** - Main content storage with full article data
5. **article_tags** - Many-to-many relationship between articles and tags
6. **article_approvals** - Approval workflow tracking
7. **comments** - User comments with moderation system
8. **media_files** - File management for images and documents
9. **newsletters** - Newsletter subscription management
10. **analytics** - Page views and user interaction tracking
11. **notifications** - System notifications for users

### Key Features

#### Role-Based Access Control
- **Super Admin**: Full system access
- **Editor**: Content approval and management
- **Journalist**: Article creation and editing
- **Contributor**: Article submission for review
- **Subscriber**: Basic user access

#### Approval Workflow
1. Author creates article (Draft status)
2. Submit for review (Pending status)
3. Editor reviews and approves/rejects
4. Approved articles are published
5. Automatic notifications at each stage

#### Security Features
- Row Level Security (RLS) on all tables
- Role-based data access policies
- Input validation constraints
- Audit trails for sensitive operations
- Data encryption at rest and in transit

## Database Views

The system includes optimized views for common queries:

- **article_summary** - Complete article information with joins
- **popular_articles** - Articles sorted by engagement metrics
- **user_statistics** - User activity and contribution stats
- **category_statistics** - Category-wise analytics
- **recent_activities** - System activity feed
- **pending_approvals** - Articles awaiting review
- **comment_moderation** - Comments requiring moderation
- **newsletter_analytics** - Subscription metrics
- **dashboard_metrics** - Key performance indicators

## Stored Procedures

Business logic is encapsulated in stored procedures:

- **publish_article()** - Publish articles with validation
- **approve_article()** - Handle approval workflow
- **increment_article_views()** - Track article views safely
- **moderate_comment()** - Comment moderation with notifications
- **get_trending_articles()** - Retrieve trending content
- **cleanup_old_analytics()** - Maintain database performance
- **generate_article_slug()** - Create unique article URLs
- **send_notification()** - User notification system
- **get_user_dashboard_data()** - Personalized dashboard data
- **archive_old_articles()** - Content lifecycle management

## Performance Optimizations

### Indexing Strategy
- Primary and foreign key indexes
- Composite indexes for complex queries
- Full-text search indexes for article content
- Partial indexes for filtered queries
- GIN indexes for JSON data and arrays

### Query Optimization
- Materialized views for heavy aggregations
- Proper use of EXPLAIN ANALYZE for query tuning
- Connection pooling for concurrent access
- Query result caching where appropriate

## Data Validation

### Constraints
- NOT NULL constraints for required fields
- UNIQUE constraints for business keys
- CHECK constraints for data validation
- Foreign key constraints for referential integrity
- Custom validation functions for complex rules

### Data Types
- UUID for primary keys (better for distributed systems)
- TIMESTAMPTZ for timezone-aware dates
- JSONB for flexible metadata storage
- ENUM types for controlled vocabularies
- TEXT for variable-length strings

## Backup and Recovery

### Automated Backups
- Daily full database backups
- Point-in-time recovery capability
- Cross-region backup replication
- Backup integrity verification

### Recovery Procedures
- Documented recovery processes
- Regular recovery testing
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 15 minutes

## Migration Files

1. **create_complete_news_database.sql** - Main database structure
2. **insert_sample_data.sql** - Sample data for testing
3. **create_database_views.sql** - Optimized views
4. **create_stored_procedures.sql** - Business logic functions

## Setup Instructions

1. **Initialize Supabase Project**
   ```bash
   # Connect to Supabase and run migrations
   supabase db reset
   ```

2. **Run Migrations**
   ```sql
   -- Execute in order:
   -- 1. create_complete_news_database.sql
   -- 2. insert_sample_data.sql
   -- 3. create_database_views.sql
   -- 4. create_stored_procedures.sql
   ```

3. **Verify Installation**
   ```sql
   -- Check table creation
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Verify sample data
   SELECT COUNT(*) FROM articles;
   SELECT COUNT(*) FROM profiles;
   ```

## Usage Examples

### Creating an Article
```sql
-- Insert new article
INSERT INTO articles (title, content, author_id, category_id, status)
VALUES (
    'Sample Article Title',
    'Article content here...',
    (SELECT id FROM profiles WHERE role = 'journalist' LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'teknologi'),
    'draft'
);
```

### Approving an Article
```sql
-- Approve article using stored procedure
SELECT approve_article(
    'article-uuid-here',
    'approver-uuid-here',
    'approved',
    'Article looks good, approved for publication'
);
```

### Getting Trending Articles
```sql
-- Get top 10 trending articles in last 24 hours
SELECT * FROM get_trending_articles(10, NULL, 24);
```

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking
- Index usage analysis
- Connection pool monitoring
- Resource utilization alerts

### Regular Maintenance
- VACUUM and ANALYZE operations
- Index maintenance and rebuilding
- Statistics updates
- Log file rotation

## Security Considerations

### Access Control
- Principle of least privilege
- Regular access reviews
- Strong password policies
- Multi-factor authentication for admins

### Data Protection
- Personal data anonymization
- GDPR compliance measures
- Data retention policies
- Secure data disposal

## Troubleshooting

### Common Issues
1. **Slow Queries**: Check indexes and query plans
2. **Connection Limits**: Monitor connection pool usage
3. **Lock Contention**: Analyze blocking queries
4. **Storage Growth**: Monitor table and index sizes

### Diagnostic Queries
```sql
-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Contributing

When making database changes:
1. Create migration files for all changes
2. Update this documentation
3. Test migrations on development environment
4. Verify backward compatibility
5. Update stored procedures if needed

## License

This database system is part of the OPINIKU.ID project and follows the same licensing terms.

---

For technical support or questions about the database system, please contact the development team.