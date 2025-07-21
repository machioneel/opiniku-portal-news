/*
  # Database Views for OPINIKU.ID News Portal

  This migration creates useful database views for common queries and reporting.
  Views provide a simplified interface for complex queries and improve performance
  by pre-defining commonly used joins and aggregations.

  ## Views Created:
  1. **article_summary** - Complete article information with author and category
  2. **popular_articles** - Articles sorted by popularity metrics
  3. **user_statistics** - User activity and contribution statistics
  4. **category_statistics** - Category-wise article and engagement statistics
  5. **recent_activities** - Recent system activities for dashboard
  6. **pending_approvals** - Articles waiting for approval with reviewer info
  7. **comment_moderation** - Comments requiring moderation
  8. **newsletter_analytics** - Newsletter subscription analytics
*/

-- 1. ARTICLE_SUMMARY VIEW
-- Provides complete article information with author and category details
CREATE OR REPLACE VIEW article_summary AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.status,
    a.is_featured,
    a.is_breaking_news,
    a.view_count,
    a.like_count,
    a.comment_count,
    a.published_at,
    a.created_at,
    a.updated_at,
    a.reading_time,
    a.featured_image_url,
    
    -- Author information
    p.full_name as author_name,
    p.role as author_role,
    
    -- Category information
    c.name as category_name,
    c.slug as category_slug,
    c.color_code as category_color,
    
    -- Engagement metrics
    COALESCE(a.view_count, 0) + COALESCE(a.like_count, 0) * 5 + COALESCE(a.comment_count, 0) * 10 as engagement_score,
    
    -- Tags (aggregated)
    COALESCE(
        (SELECT string_agg(t.name, ', ' ORDER BY t.name)
         FROM article_tags at
         JOIN tags t ON at.tag_id = t.id
         WHERE at.article_id = a.id), 
        ''
    ) as tags
    
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id
LEFT JOIN categories c ON a.category_id = c.id;

-- 2. POPULAR_ARTICLES VIEW
-- Articles sorted by various popularity metrics
CREATE OR REPLACE VIEW popular_articles AS
SELECT 
    a.*,
    -- Popularity score calculation (weighted)
    (COALESCE(a.view_count, 0) * 1.0 + 
     COALESCE(a.like_count, 0) * 5.0 + 
     COALESCE(a.comment_count, 0) * 10.0) as popularity_score,
    
    -- Time-based popularity (recent articles get boost)
    (COALESCE(a.view_count, 0) * 1.0 + 
     COALESCE(a.like_count, 0) * 5.0 + 
     COALESCE(a.comment_count, 0) * 10.0) * 
    (1 + EXTRACT(EPOCH FROM (now() - a.published_at)) / -86400.0 * 0.1) as trending_score
    
FROM article_summary a
WHERE a.status = 'published'
ORDER BY popularity_score DESC;

-- 3. USER_STATISTICS VIEW
-- User activity and contribution statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at as joined_at,
    p.last_login_at,
    
    -- Article statistics
    COUNT(DISTINCT a.id) as total_articles,
    COUNT(DISTINCT CASE WHEN a.status = 'published' THEN a.id END) as published_articles,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_articles,
    COUNT(DISTINCT CASE WHEN a.status = 'draft' THEN a.id END) as draft_articles,
    
    -- Engagement statistics
    COALESCE(SUM(a.view_count), 0) as total_views,
    COALESCE(SUM(a.like_count), 0) as total_likes,
    COALESCE(SUM(a.comment_count), 0) as total_comments,
    
    -- Comment statistics (as commenter)
    COUNT(DISTINCT c.id) as comments_made,
    
    -- Recent activity
    MAX(a.created_at) as last_article_date,
    MAX(c.created_at) as last_comment_date
    
FROM profiles p
LEFT JOIN articles a ON p.id = a.author_id
LEFT JOIN comments c ON p.id = c.author_id
GROUP BY p.id, p.full_name, p.role, p.is_active, p.created_at, p.last_login_at;

-- 4. CATEGORY_STATISTICS VIEW
-- Category-wise article and engagement statistics
CREATE OR REPLACE VIEW category_statistics AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.color_code,
    c.is_active,
    
    -- Article counts
    COUNT(DISTINCT a.id) as total_articles,
    COUNT(DISTINCT CASE WHEN a.status = 'published' THEN a.id END) as published_articles,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_articles,
    
    -- Engagement metrics
    COALESCE(SUM(a.view_count), 0) as total_views,
    COALESCE(SUM(a.like_count), 0) as total_likes,
    COALESCE(SUM(a.comment_count), 0) as total_comments,
    COALESCE(AVG(a.view_count), 0) as avg_views_per_article,
    
    -- Recent activity
    MAX(a.published_at) as last_published_article,
    COUNT(DISTINCT a.author_id) as unique_authors
    
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id
GROUP BY c.id, c.name, c.slug, c.color_code, c.is_active;

-- 5. RECENT_ACTIVITIES VIEW
-- Recent system activities for dashboard
CREATE OR REPLACE VIEW recent_activities AS
(
    SELECT 
        'article_published' as activity_type,
        a.title as title,
        p.full_name as actor_name,
        a.published_at as activity_time,
        jsonb_build_object(
            'article_id', a.id,
            'article_slug', a.slug,
            'category', c.name
        ) as metadata
    FROM articles a
    JOIN profiles p ON a.author_id = p.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published' AND a.published_at IS NOT NULL
)
UNION ALL
(
    SELECT 
        'comment_posted' as activity_type,
        'Komentar pada: ' || a.title as title,
        p.full_name as actor_name,
        c.created_at as activity_time,
        jsonb_build_object(
            'comment_id', c.id,
            'article_id', a.id,
            'article_slug', a.slug
        ) as metadata
    FROM comments c
    JOIN articles a ON c.article_id = a.id
    JOIN profiles p ON c.author_id = p.id
    WHERE c.status = 'approved'
)
UNION ALL
(
    SELECT 
        'user_joined' as activity_type,
        'Pengguna baru bergabung' as title,
        p.full_name as actor_name,
        p.created_at as activity_time,
        jsonb_build_object(
            'user_id', p.id,
            'role', p.role
        ) as metadata
    FROM profiles p
    WHERE p.is_active = true
)
ORDER BY activity_time DESC
LIMIT 50;

-- 6. PENDING_APPROVALS VIEW
-- Articles waiting for approval with reviewer information
CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
    a.id as article_id,
    a.title,
    a.slug,
    a.excerpt,
    a.created_at as submitted_at,
    a.featured_image_url,
    
    -- Author information
    author.full_name as author_name,
    author.role as author_role,
    
    -- Category information
    c.name as category_name,
    c.color_code as category_color,
    
    -- Approval information
    ap.id as approval_id,
    ap.status as approval_status,
    ap.comments as approval_comments,
    ap.created_at as approval_requested_at,
    
    -- Approver information (if assigned)
    approver.full_name as approver_name,
    
    -- Time waiting for approval
    EXTRACT(EPOCH FROM (now() - ap.created_at)) / 3600 as hours_waiting,
    
    -- Priority score (based on author role and waiting time)
    CASE 
        WHEN author.role = 'journalist' THEN 2
        WHEN author.role = 'contributor' THEN 1
        ELSE 0
    END + 
    CASE 
        WHEN EXTRACT(EPOCH FROM (now() - ap.created_at)) / 3600 > 24 THEN 2
        WHEN EXTRACT(EPOCH FROM (now() - ap.created_at)) / 3600 > 12 THEN 1
        ELSE 0
    END as priority_score
    
FROM articles a
JOIN profiles author ON a.author_id = author.id
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_approvals ap ON a.id = ap.article_id
LEFT JOIN profiles approver ON ap.approver_id = approver.id
WHERE a.status = 'pending'
ORDER BY priority_score DESC, ap.created_at ASC;

-- 7. COMMENT_MODERATION VIEW
-- Comments requiring moderation
CREATE OR REPLACE VIEW comment_moderation AS
SELECT 
    c.id as comment_id,
    c.content,
    c.status,
    c.created_at as comment_date,
    c.like_count,
    
    -- Article information
    a.title as article_title,
    a.slug as article_slug,
    
    -- Commenter information
    commenter.full_name as commenter_name,
    commenter.role as commenter_role,
    
    -- Parent comment (if reply)
    parent_c.content as parent_comment,
    parent_commenter.full_name as parent_commenter_name,
    
    -- Moderation priority
    CASE 
        WHEN c.status = 'spam' THEN 3
        WHEN c.status = 'pending' AND EXTRACT(EPOCH FROM (now() - c.created_at)) / 3600 > 24 THEN 2
        WHEN c.status = 'pending' THEN 1
        ELSE 0
    END as moderation_priority,
    
    -- Time waiting for moderation
    EXTRACT(EPOCH FROM (now() - c.created_at)) / 3600 as hours_waiting
    
FROM comments c
JOIN articles a ON c.article_id = a.id
LEFT JOIN profiles commenter ON c.author_id = commenter.id
LEFT JOIN comments parent_c ON c.parent_id = parent_c.id
LEFT JOIN profiles parent_commenter ON parent_c.author_id = parent_commenter.id
WHERE c.status IN ('pending', 'spam')
ORDER BY moderation_priority DESC, c.created_at ASC;

-- 8. NEWSLETTER_ANALYTICS VIEW
-- Newsletter subscription analytics
CREATE OR REPLACE VIEW newsletter_analytics AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_subscribers,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_subscribers,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_subscribers,
    COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_subscribers,
    
    -- Growth metrics
    COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_subscribers_week,
    COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_subscribers_month,
    COUNT(CASE WHEN unsubscribed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as unsubscribed_week,
    COUNT(CASE WHEN unsubscribed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as unsubscribed_month,
    
    -- Conversion rate
    ROUND(
        COUNT(CASE WHEN is_verified = true THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as verification_rate
    
FROM newsletters;

-- 9. DASHBOARD_METRICS VIEW
-- Key metrics for admin dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    -- Article metrics
    (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
    (SELECT COUNT(*) FROM articles WHERE status = 'pending') as pending_articles,
    (SELECT COUNT(*) FROM articles WHERE status = 'draft') as draft_articles,
    (SELECT COUNT(*) FROM articles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as articles_this_week,
    
    -- User metrics
    (SELECT COUNT(*) FROM profiles WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'journalist') as journalists,
    (SELECT COUNT(*) FROM profiles WHERE role = 'contributor') as contributors,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
    
    -- Engagement metrics
    (SELECT COALESCE(SUM(view_count), 0) FROM articles WHERE status = 'published') as total_views,
    (SELECT COUNT(*) FROM comments WHERE status = 'approved') as approved_comments,
    (SELECT COUNT(*) FROM comments WHERE status = 'pending') as pending_comments,
    (SELECT COUNT(*) FROM newsletters WHERE is_active = true) as newsletter_subscribers,
    
    -- Recent activity
    (SELECT COUNT(*) FROM articles WHERE published_at >= CURRENT_DATE - INTERVAL '24 hours') as articles_today,
    (SELECT COUNT(*) FROM comments WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours') as comments_today,
    (SELECT COALESCE(SUM(view_count), 0) FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours' AND event_type = 'view') as views_today;

-- Create indexes on views for better performance
CREATE INDEX IF NOT EXISTS idx_article_summary_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_article_summary_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_popular_articles_engagement ON articles((view_count + like_count * 5 + comment_count * 10));

-- Grant appropriate permissions
-- Note: In Supabase, these permissions are handled through RLS policies
-- but we can create comments for documentation

COMMENT ON VIEW article_summary IS 'Complete article information with author and category details';
COMMENT ON VIEW popular_articles IS 'Articles sorted by popularity and trending metrics';
COMMENT ON VIEW user_statistics IS 'User activity and contribution statistics';
COMMENT ON VIEW category_statistics IS 'Category-wise article and engagement statistics';
COMMENT ON VIEW recent_activities IS 'Recent system activities for dashboard display';
COMMENT ON VIEW pending_approvals IS 'Articles waiting for approval with priority scoring';
COMMENT ON VIEW comment_moderation IS 'Comments requiring moderation with priority';
COMMENT ON VIEW newsletter_analytics IS 'Newsletter subscription analytics and metrics';
COMMENT ON VIEW dashboard_metrics IS 'Key performance metrics for admin dashboard';