/*
  # Complete Database System for OPINIKU.ID News Portal - FIXED VERSION

  ## Overview
  This migration creates a comprehensive database system for a news portal with:
  - User management with role-based access control
  - Article management with approval workflow
  - Category and tag system
  - Comment system with moderation
  - Analytics and reporting
  - Media management
  - Newsletter subscription system

  ## Database Management System
  PostgreSQL (via Supabase) - chosen for:
  - Advanced JSON support for flexible content
  - Full-text search capabilities
  - Row Level Security (RLS)
  - Excellent performance with proper indexing
  - ACID compliance for data integrity
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types for better data integrity
CREATE TYPE user_role AS ENUM ('super_admin', 'editor', 'journalist', 'contributor', 'subscriber');
CREATE TYPE article_status AS ENUM ('draft', 'pending', 'approved', 'published', 'rejected', 'archived');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'spam');
CREATE TYPE notification_type AS ENUM ('article_submitted', 'article_approved', 'article_rejected', 'comment_posted', 'system_alert');

-- 1. PROFILES TABLE (Extended user information)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'subscriber',
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) >= 2),
    CONSTRAINT profiles_phone_format CHECK (phone ~ '^[+]?[0-9\s\-\(\)]+$' OR phone IS NULL)
);

-- 2. CATEGORIES TABLE (News categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT DEFAULT '#6B7280',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT categories_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9\-]+$'),
    CONSTRAINT categories_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$')
);

-- 3. TAGS TABLE (Article tags)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT tags_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT tags_slug_format CHECK (slug ~ '^[a-z0-9\-]+$')
);

-- 4. ARTICLES TABLE (Main content)
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status article_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_breaking_news BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    reading_time INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT articles_title_length CHECK (char_length(title) >= 5),
    CONSTRAINT articles_slug_format CHECK (slug ~ '^[a-z0-9\-]+$'),
    CONSTRAINT articles_content_length CHECK (char_length(content) >= 100),
    CONSTRAINT articles_reading_time_positive CHECK (reading_time > 0 OR reading_time IS NULL)
);

-- 5. ARTICLE_TAGS TABLE (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(article_id, tag_id)
);

-- 6. ARTICLE_APPROVALS TABLE (Approval workflow)
CREATE TABLE IF NOT EXISTS article_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status approval_status DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT article_approvals_comments_length CHECK (char_length(comments) <= 1000 OR comments IS NULL)
);

-- 7. COMMENTS TABLE (User comments)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
    content TEXT NOT NULL,
    status comment_status DEFAULT 'pending',
    like_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT comments_content_length CHECK (char_length(content) >= 3 AND char_length(content) <= 2000)
);

-- 8. MEDIA_FILES TABLE (File management)
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT media_files_file_size_positive CHECK (file_size > 0),
    CONSTRAINT media_files_dimensions_positive CHECK (
        (width > 0 AND height > 0) OR (width IS NULL AND height IS NULL)
    )
);

-- 9. NEWSLETTERS TABLE (Newsletter subscriptions)
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    verification_token TEXT,
    is_verified BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    
    CONSTRAINT newsletters_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 10. ANALYTICS TABLE (Page views and interactions)
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT analytics_event_type_valid CHECK (event_type IN ('view', 'like', 'share', 'comment', 'search'))
);

-- 11. NOTIFICATIONS TABLE (System notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT notifications_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT notifications_message_length CHECK (char_length(message) >= 5)
);

-- CREATE INDEXES for optimal performance
-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);

-- Articles indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking_news ON articles(is_breaking_news);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Full-text search index for articles
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content));

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_status_published ON articles(category_id, status, published_at DESC);

-- Article tags indexes
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);

-- Article approvals indexes
CREATE INDEX IF NOT EXISTS idx_article_approvals_article_id ON article_approvals(article_id);
CREATE INDEX IF NOT EXISTS idx_article_approvals_approver_id ON article_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_article_approvals_status ON article_approvals(status);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_article_id ON analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ENABLE ROW LEVEL SECURITY on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles policies
CREATE POLICY "Users can view all active profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Categories policies
CREATE POLICY "Anyone can view active categories"
    ON categories FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Tags policies
CREATE POLICY "Anyone can view tags"
    ON tags FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Content creators can manage tags"
    ON tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor', 'journalist', 'contributor')
        )
    );

-- Articles policies
CREATE POLICY "Anyone can view published articles"
    ON articles FOR SELECT
    TO authenticated, anon
    USING (status = 'published');

CREATE POLICY "Authors can view own articles"
    ON articles FOR SELECT
    TO authenticated
    USING (
        author_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Authors can create articles"
    ON articles FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id IN (
            SELECT p.id FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor', 'journalist', 'contributor')
        )
    );

CREATE POLICY "Authors can update own draft articles"
    ON articles FOR UPDATE
    TO authenticated
    USING (
        author_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
        AND status IN ('draft', 'rejected')
    );

CREATE POLICY "Editors can manage all articles"
    ON articles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Article tags policies
CREATE POLICY "Anyone can view article tags"
    ON article_tags FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authors can manage own article tags"
    ON article_tags FOR ALL
    TO authenticated
    USING (
        article_id IN (
            SELECT a.id FROM articles a
            JOIN profiles p ON a.author_id = p.id
            WHERE p.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Article approvals policies
CREATE POLICY "Editors can manage approvals"
    ON article_approvals FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

CREATE POLICY "Authors can view own article approvals"
    ON article_approvals FOR SELECT
    TO authenticated
    USING (
        article_id IN (
            SELECT a.id FROM articles a
            JOIN profiles p ON a.author_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Comments policies
CREATE POLICY "Anyone can view approved comments"
    ON comments FOR SELECT
    TO authenticated, anon
    USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own pending comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (
        author_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
        AND status = 'pending'
    );

CREATE POLICY "Moderators can manage comments"
    ON comments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Media files policies
CREATE POLICY "Anyone can view public media files"
    ON media_files FOR SELECT
    TO authenticated, anon
    USING (is_public = true);

CREATE POLICY "Users can upload media files"
    ON media_files FOR INSERT
    TO authenticated
    WITH CHECK (
        uploaded_by IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own media files"
    ON media_files FOR ALL
    TO authenticated
    USING (
        uploaded_by IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

-- Analytics policies
CREATE POLICY "Editors can view analytics"
    ON analytics FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('super_admin', 'editor')
        )
    );

CREATE POLICY "System can insert analytics"
    ON analytics FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (
        recipient_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (
        recipient_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- TRIGGERS for automated tasks

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tag_usage_on_article_tags
    AFTER INSERT OR DELETE ON article_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Update article comment count
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE articles SET comment_count = comment_count - 1 WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_comment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- Auto-approve articles from trusted authors (super_admin, editor)
CREATE OR REPLACE FUNCTION auto_approve_trusted_articles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        -- Check if author is trusted (super_admin or editor)
        IF EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = NEW.author_id 
            AND p.role IN ('super_admin', 'editor')
        ) THEN
            NEW.status = 'approved';
            NEW.published_at = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_approve_trusted_articles_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION auto_approve_trusted_articles();

-- Create notification on article status change
CREATE OR REPLACE FUNCTION create_article_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if status changed
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO notifications (recipient_id, type, title, message, data)
        VALUES (
            NEW.author_id,
            CASE 
                WHEN NEW.status = 'approved' THEN 'article_approved'::notification_type
                WHEN NEW.status = 'rejected' THEN 'article_rejected'::notification_type
                ELSE 'system_alert'::notification_type
            END,
            CASE 
                WHEN NEW.status = 'approved' THEN 'Artikel Disetujui'
                WHEN NEW.status = 'rejected' THEN 'Artikel Ditolak'
                ELSE 'Status Artikel Berubah'
            END,
            CASE 
                WHEN NEW.status = 'approved' THEN 'Artikel "' || NEW.title || '" telah disetujui dan dipublikasi.'
                WHEN NEW.status = 'rejected' THEN 'Artikel "' || NEW.title || '" ditolak. Silakan periksa komentar reviewer.'
                ELSE 'Status artikel "' || NEW.title || '" berubah menjadi ' || NEW.status
            END,
            jsonb_build_object('article_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_article_status_notification_trigger
    AFTER UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION create_article_status_notification();