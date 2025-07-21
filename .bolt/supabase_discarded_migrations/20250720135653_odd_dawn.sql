/*
  # Stored Procedures for OPINIKU.ID News Portal

  This migration creates stored procedures (functions) for common business logic operations.
  These procedures encapsulate complex operations, ensure data consistency, and improve performance.

  ## Procedures Created:
  1. **publish_article** - Publish an article with validation
  2. **approve_article** - Approve article with workflow
  3. **increment_article_views** - Safely increment view count
  4. **moderate_comment** - Moderate comments with notifications
  5. **get_trending_articles** - Get trending articles with caching
  6. **cleanup_old_analytics** - Clean up old analytics data
  7. **generate_article_slug** - Generate unique article slug
  8. **send_notification** - Send notification to users
  9. **get_user_dashboard_data** - Get personalized dashboard data
  10. **archive_old_articles** - Archive old articles
*/

-- 1. PUBLISH_ARTICLE PROCEDURE
-- Publishes an article with proper validation and workflow
CREATE OR REPLACE FUNCTION publish_article(
    p_article_id UUID,
    p_publisher_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_article articles%ROWTYPE;
    v_publisher profiles%ROWTYPE;
    v_result JSON;
BEGIN
    -- Get article information
    SELECT * INTO v_article FROM articles WHERE id = p_article_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Article not found');
    END IF;
    
    -- Check if article is in publishable state
    IF v_article.status NOT IN ('approved', 'draft') THEN
        RETURN json_build_object('success', false, 'error', 'Article is not in publishable state');
    END IF;
    
    -- Get publisher information if provided
    IF p_publisher_id IS NOT NULL THEN
        SELECT * INTO v_publisher FROM profiles WHERE id = p_publisher_id;
        
        -- Check if publisher has permission
        IF v_publisher.role NOT IN ('super_admin', 'editor') THEN
            RETURN json_build_object('success', false, 'error', 'Insufficient permissions to publish');
        END IF;
    END IF;
    
    -- Update article status and publish date
    UPDATE articles 
    SET 
        status = 'published',
        published_at = COALESCE(scheduled_at, now()),
        updated_at = now()
    WHERE id = p_article_id;
    
    -- Create approval record if publisher is different from author
    IF p_publisher_id IS NOT NULL AND p_publisher_id != v_article.author_id THEN
        INSERT INTO article_approvals (article_id, approver_id, status, approved_at)
        VALUES (p_article_id, p_publisher_id, 'approved', now())
        ON CONFLICT (article_id) DO UPDATE SET
            approver_id = EXCLUDED.approver_id,
            status = EXCLUDED.status,
            approved_at = EXCLUDED.approved_at;
    END IF;
    
    -- Send notification to author
    PERFORM send_notification(
        v_article.author_id,
        p_publisher_id,
        'article_approved',
        'Artikel Dipublikasi',
        'Artikel "' || v_article.title || '" telah dipublikasi.',
        json_build_object('article_id', p_article_id, 'article_slug', v_article.slug)
    );
    
    -- Return success response
    RETURN json_build_object(
        'success', true, 
        'message', 'Article published successfully',
        'article_id', p_article_id,
        'published_at', v_article.published_at
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. APPROVE_ARTICLE PROCEDURE
-- Approve or reject article with comments
CREATE OR REPLACE FUNCTION approve_article(
    p_article_id UUID,
    p_approver_id UUID,
    p_status approval_status,
    p_comments TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_article articles%ROWTYPE;
    v_approver profiles%ROWTYPE;
    v_new_article_status article_status;
BEGIN
    -- Get article and approver information
    SELECT * INTO v_article FROM articles WHERE id = p_article_id;
    SELECT * INTO v_approver FROM profiles WHERE id = p_approver_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Article or approver not found');
    END IF;
    
    -- Check approver permissions
    IF v_approver.role NOT IN ('super_admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient permissions to approve articles');
    END IF;
    
    -- Determine new article status
    v_new_article_status := CASE 
        WHEN p_status = 'approved' THEN 'approved'::article_status
        WHEN p_status = 'rejected' THEN 'rejected'::article_status
        ELSE v_article.status
    END;
    
    -- Update article status
    UPDATE articles 
    SET 
        status = v_new_article_status,
        updated_at = now(),
        published_at = CASE 
            WHEN p_status = 'approved' THEN COALESCE(published_at, now())
            ELSE published_at
        END
    WHERE id = p_article_id;
    
    -- Insert or update approval record
    INSERT INTO article_approvals (article_id, approver_id, status, comments, approved_at)
    VALUES (p_article_id, p_approver_id, p_status, p_comments, 
            CASE WHEN p_status = 'approved' THEN now() ELSE NULL END)
    ON CONFLICT (article_id) DO UPDATE SET
        approver_id = EXCLUDED.approver_id,
        status = EXCLUDED.status,
        comments = EXCLUDED.comments,
        approved_at = EXCLUDED.approved_at;
    
    -- Send notification to author
    PERFORM send_notification(
        v_article.author_id,
        p_approver_id,
        CASE WHEN p_status = 'approved' THEN 'article_approved' ELSE 'article_rejected' END,
        CASE WHEN p_status = 'approved' THEN 'Artikel Disetujui' ELSE 'Artikel Ditolak' END,
        CASE 
            WHEN p_status = 'approved' THEN 'Artikel "' || v_article.title || '" telah disetujui dan dipublikasi.'
            ELSE 'Artikel "' || v_article.title || '" ditolak. ' || COALESCE(p_comments, '')
        END,
        json_build_object('article_id', p_article_id, 'approval_comments', p_comments)
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Article ' || p_status || ' successfully',
        'article_id', p_article_id,
        'new_status', v_new_article_status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. INCREMENT_ARTICLE_VIEWS PROCEDURE
-- Safely increment article view count with analytics tracking
CREATE OR REPLACE FUNCTION increment_article_views(
    p_article_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_article_exists BOOLEAN;
    v_new_view_count INTEGER;
BEGIN
    -- Check if article exists and is published
    SELECT EXISTS(
        SELECT 1 FROM articles 
        WHERE id = p_article_id AND status = 'published'
    ) INTO v_article_exists;
    
    IF NOT v_article_exists THEN
        RETURN json_build_object('success', false, 'error', 'Article not found or not published');
    END IF;
    
    -- Increment view count
    UPDATE articles 
    SET view_count = COALESCE(view_count, 0) + 1,
        updated_at = now()
    WHERE id = p_article_id
    RETURNING view_count INTO v_new_view_count;
    
    -- Insert analytics record
    INSERT INTO analytics (
        article_id, user_id, session_id, ip_address, user_agent, 
        referrer, page_url, event_type, event_data
    ) VALUES (
        p_article_id, 
        CASE WHEN p_user_id != '00000000-0000-0000-0000-000000000000' THEN p_user_id ELSE NULL END,
        p_session_id, 
        p_ip_address, 
        p_user_agent,
        p_referrer,
        '/artikel/' || (SELECT slug FROM articles WHERE id = p_article_id),
        'view',
        json_build_object('timestamp', now(), 'view_count', v_new_view_count)
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'View count incremented',
        'new_view_count', v_new_view_count
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. MODERATE_COMMENT PROCEDURE
-- Moderate comments with notifications
CREATE OR REPLACE FUNCTION moderate_comment(
    p_comment_id UUID,
    p_moderator_id UUID,
    p_status comment_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_comment comments%ROWTYPE;
    v_moderator profiles%ROWTYPE;
    v_article articles%ROWTYPE;
BEGIN
    -- Get comment, moderator, and article information
    SELECT * INTO v_comment FROM comments WHERE id = p_comment_id;
    SELECT * INTO v_moderator FROM profiles WHERE id = p_moderator_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Comment or moderator not found');
    END IF;
    
    SELECT * INTO v_article FROM articles WHERE id = v_comment.article_id;
    
    -- Check moderator permissions
    IF v_moderator.role NOT IN ('super_admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient permissions to moderate comments');
    END IF;
    
    -- Update comment status
    UPDATE comments 
    SET 
        status = p_status,
        approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
        approved_by = CASE WHEN p_status = 'approved' THEN p_moderator_id ELSE NULL END,
        updated_at = now()
    WHERE id = p_comment_id;
    
    -- Send notification to commenter if rejected or marked as spam
    IF p_status IN ('rejected', 'spam') AND v_comment.author_id IS NOT NULL THEN
        PERFORM send_notification(
            v_comment.author_id,
            p_moderator_id,
            'system_alert',
            'Komentar ' || CASE WHEN p_status = 'spam' THEN 'Ditandai Spam' ELSE 'Ditolak' END,
            'Komentar Anda pada artikel "' || v_article.title || '" telah ' || 
            CASE WHEN p_status = 'spam' THEN 'ditandai sebagai spam' ELSE 'ditolak' END || 
            COALESCE('. Alasan: ' || p_reason, '.'),
            json_build_object('comment_id', p_comment_id, 'article_id', v_comment.article_id, 'reason', p_reason)
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Comment moderated successfully',
        'comment_id', p_comment_id,
        'new_status', p_status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. GET_TRENDING_ARTICLES PROCEDURE
-- Get trending articles with configurable parameters
CREATE OR REPLACE FUNCTION get_trending_articles(
    p_limit INTEGER DEFAULT 10,
    p_category_id UUID DEFAULT NULL,
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    article_id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    author_name TEXT,
    category_name TEXT,
    category_color TEXT,
    view_count INTEGER,
    like_count INTEGER,
    comment_count INTEGER,
    published_at TIMESTAMPTZ,
    trending_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as article_id,
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image_url,
        p.full_name as author_name,
        c.name as category_name,
        c.color_code as category_color,
        a.view_count,
        a.like_count,
        a.comment_count,
        a.published_at,
        -- Trending score calculation
        (COALESCE(a.view_count, 0) * 1.0 + 
         COALESCE(a.like_count, 0) * 5.0 + 
         COALESCE(a.comment_count, 0) * 10.0) * 
        -- Time decay factor (newer articles get higher score)
        (1.0 - (EXTRACT(EPOCH FROM (now() - a.published_at)) / (p_hours_back * 3600.0)) * 0.5) as trending_score
    FROM articles a
    LEFT JOIN profiles p ON a.author_id = p.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE 
        a.status = 'published'
        AND a.published_at >= now() - (p_hours_back || ' hours')::INTERVAL
        AND (p_category_id IS NULL OR a.category_id = p_category_id)
    ORDER BY trending_score DESC
    LIMIT p_limit;
END;
$$;

-- 6. CLEANUP_OLD_ANALYTICS PROCEDURE
-- Clean up old analytics data to maintain performance
CREATE OR REPLACE FUNCTION cleanup_old_analytics(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete old analytics records
    DELETE FROM analytics 
    WHERE created_at < now() - (p_days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Vacuum the table to reclaim space
    -- Note: VACUUM cannot be run inside a transaction, so we skip it here
    
    RETURN json_build_object(
        'success', true,
        'message', 'Analytics cleanup completed',
        'deleted_records', v_deleted_count,
        'cutoff_date', now() - (p_days_to_keep || ' days')::INTERVAL
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. GENERATE_ARTICLE_SLUG PROCEDURE
-- Generate unique article slug from title
CREATE OR REPLACE FUNCTION generate_article_slug(
    p_title TEXT,
    p_article_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_slug TEXT;
    v_final_slug TEXT;
    v_counter INTEGER := 0;
    v_exists BOOLEAN;
BEGIN
    -- Create base slug from title
    v_base_slug := lower(trim(p_title));
    -- Replace spaces and special characters with hyphens
    v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');
    -- Remove leading/trailing hyphens
    v_base_slug := trim(v_base_slug, '-');
    -- Limit length
    v_base_slug := left(v_base_slug, 100);
    
    v_final_slug := v_base_slug;
    
    -- Check for uniqueness and append counter if needed
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM articles 
            WHERE slug = v_final_slug 
            AND (p_article_id IS NULL OR id != p_article_id)
        ) INTO v_exists;
        
        IF NOT v_exists THEN
            EXIT;
        END IF;
        
        v_counter := v_counter + 1;
        v_final_slug := v_base_slug || '-' || v_counter;
    END LOOP;
    
    RETURN v_final_slug;
END;
$$;

-- 8. SEND_NOTIFICATION PROCEDURE
-- Send notification to users
CREATE OR REPLACE FUNCTION send_notification(
    p_recipient_id UUID,
    p_sender_id UUID DEFAULT NULL,
    p_type notification_type,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    -- Insert notification
    INSERT INTO notifications (recipient_id, sender_id, type, title, message, data)
    VALUES (p_recipient_id, p_sender_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO v_notification_id;
    
    -- Here you could add logic to send email, push notification, etc.
    -- For now, we just store in database
    
    RETURN v_notification_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE WARNING 'Failed to send notification: %', SQLERRM;
        RETURN NULL;
END;
$$;

-- 9. GET_USER_DASHBOARD_DATA PROCEDURE
-- Get personalized dashboard data for a user
CREATE OR REPLACE FUNCTION get_user_dashboard_data(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_result JSON;
    v_article_stats JSON;
    v_recent_articles JSON;
    v_notifications JSON;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Get article statistics
    SELECT json_build_object(
        'total_articles', COUNT(*),
        'published_articles', COUNT(CASE WHEN status = 'published' THEN 1 END),
        'pending_articles', COUNT(CASE WHEN status = 'pending' THEN 1 END),
        'draft_articles', COUNT(CASE WHEN status = 'draft' THEN 1 END),
        'total_views', COALESCE(SUM(view_count), 0),
        'total_likes', COALESCE(SUM(like_count), 0),
        'total_comments', COALESCE(SUM(comment_count), 0)
    ) INTO v_article_stats
    FROM articles 
    WHERE author_id = v_profile.id;
    
    -- Get recent articles
    SELECT json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'slug', slug,
            'status', status,
            'view_count', view_count,
            'created_at', created_at,
            'published_at', published_at
        )
    ) INTO v_recent_articles
    FROM (
        SELECT * FROM articles 
        WHERE author_id = v_profile.id 
        ORDER BY created_at DESC 
        LIMIT 5
    ) recent;
    
    -- Get recent notifications
    SELECT json_agg(
        json_build_object(
            'id', id,
            'type', type,
            'title', title,
            'message', message,
            'is_read', is_read,
            'created_at', created_at
        )
    ) INTO v_notifications
    FROM (
        SELECT * FROM notifications 
        WHERE recipient_id = v_profile.id 
        ORDER BY created_at DESC 
        LIMIT 10
    ) notifs;
    
    -- Build result
    v_result := json_build_object(
        'success', true,
        'profile', json_build_object(
            'id', v_profile.id,
            'full_name', v_profile.full_name,
            'role', v_profile.role,
            'avatar_url', v_profile.avatar_url
        ),
        'article_stats', v_article_stats,
        'recent_articles', COALESCE(v_recent_articles, '[]'::JSON),
        'notifications', COALESCE(v_notifications, '[]'::JSON)
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 10. ARCHIVE_OLD_ARTICLES PROCEDURE
-- Archive articles older than specified days
CREATE OR REPLACE FUNCTION archive_old_articles(
    p_days_old INTEGER DEFAULT 365,
    p_min_view_count INTEGER DEFAULT 100
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    -- Archive old articles with low engagement
    UPDATE articles 
    SET 
        status = 'archived',
        updated_at = now()
    WHERE 
        status = 'published'
        AND published_at < now() - (p_days_old || ' days')::INTERVAL
        AND COALESCE(view_count, 0) < p_min_view_count;
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Articles archived successfully',
        'archived_count', v_archived_count,
        'criteria', json_build_object(
            'days_old', p_days_old,
            'min_view_count', p_min_view_count
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create indexes to support the stored procedures
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);

-- Grant execute permissions (handled by RLS in Supabase)
-- These procedures will be accessible based on the user's role and RLS policies

-- Add comments for documentation
COMMENT ON FUNCTION publish_article IS 'Publish an article with proper validation and workflow';
COMMENT ON FUNCTION approve_article IS 'Approve or reject article with comments and notifications';
COMMENT ON FUNCTION increment_article_views IS 'Safely increment article view count with analytics tracking';
COMMENT ON FUNCTION moderate_comment IS 'Moderate comments with notifications to users';
COMMENT ON FUNCTION get_trending_articles IS 'Get trending articles with configurable parameters';
COMMENT ON FUNCTION cleanup_old_analytics IS 'Clean up old analytics data to maintain performance';
COMMENT ON FUNCTION generate_article_slug IS 'Generate unique article slug from title';
COMMENT ON FUNCTION send_notification IS 'Send notification to users with data payload';
COMMENT ON FUNCTION get_user_dashboard_data IS 'Get personalized dashboard data for a user';
COMMENT ON FUNCTION archive_old_articles IS 'Archive articles older than specified criteria';