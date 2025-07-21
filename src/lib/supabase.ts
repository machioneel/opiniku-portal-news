import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Profiles {
  id: string;
  user_id: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'journalist' | 'contributor' | 'subscriber';
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  last_login_at?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author_id: string;
  category_id: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'archived';
  is_featured: boolean;
  is_breaking_news: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at?: string;
  scheduled_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  reading_time?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color_code: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced Database Service with proper error handling
export class DatabaseService {
  // Authentication helpers
  static async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // Create profile after successful signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            user_id: data.user.id,
            full_name: fullName,
            role: 'subscriber',
            is_active: true,
            email_verified: false
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    console.log('🔐 DatabaseService: Starting signInWithPassword for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📡 DatabaseService: Supabase auth response received');
      if (error) throw error;

      console.log('✅ DatabaseService: Authentication successful for:', data.user?.email);
      console.log('👤 DatabaseService: User data:', {
        id: data.user?.id,
        email: data.user?.email,
        confirmed_at: data.user?.confirmed_at
      });

      // Update last login
      if (data.user) {
        console.log('⏰ DatabaseService: Updating last login timestamp');
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', data.user.id);
        console.log('✅ DatabaseService: Last login timestamp updated');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ DatabaseService: Signin error:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        details: error
      });
      return { data: null, error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Signout error:', error);
      return { error };
    }
  }

  // Profile management
  static async getProfile(userId: string) {
    console.log('📋 DatabaseService: Getting profile for user ID:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('📡 DatabaseService: Profile query response received');
      if (error) throw error;
      
      console.log('✅ DatabaseService: Profile retrieved successfully:', {
        id: data.id,
        full_name: data.full_name,
        role: data.role,
        is_active: data.is_active,
        email_verified: data.email_verified
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ DatabaseService: Get profile error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      return { data: null, error };
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  }

  // Articles management
  static async getArticles(filters?: {
    status?: string;
    category?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('article_summary')
        .select('*')
        .order('published_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category_slug', filters.category);
      }
      if (filters?.author) {
        query = query.eq('author_name', filters.author);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get articles error:', error);
      return { data: [], error };
    }
  }

  static async getArticleById(id: string) {
    try {
      const { data, error } = await supabase
        .from('article_summary')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get article by ID error:', error);
      return { data: null, error };
    }
  }

  static async createArticle(article: Partial<Article>) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Create article error:', error);
      return { data: null, error };
    }
  }

  static async updateArticle(id: string, updates: Partial<Article>) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update article error:', error);
      return { data: null, error };
    }
  }

  // Categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get categories error:', error);
      return { data: [], error };
    }
  }

  // Dashboard metrics
  static async getDashboardMetrics() {
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get dashboard metrics error:', error);
      return { data: null, error };
    }
  }

  // Analytics
  static async trackPageView(articleId: string, userId?: string) {
    try {
      const { error } = await supabase
        .from('analytics')
        .insert([{
          article_id: articleId,
          user_id: userId,
          event_type: 'view',
          page_url: window.location.href,
          event_data: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        }]);

      if (error) {
        console.error('Track page view error:', error);
      }
    } catch (error) {
      console.error('Track page view error:', error);
    }
  }
}

// Role-based access control helpers
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  EDITOR: 'editor',
  JOURNALIST: 'journalist',
  CONTRIBUTOR: 'contributor',
  SUBSCRIBER: 'subscriber'
} as const;

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.EDITOR]: 4,
  [ROLES.JOURNALIST]: 3,
  [ROLES.CONTRIBUTOR]: 2,
  [ROLES.SUBSCRIBER]: 1
} as const;

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
  return userLevel >= requiredLevel;
};

export const canManageUsers = (userRole: string): boolean => {
  return hasPermission(userRole, ROLES.EDITOR);
};

export const canApproveArticles = (userRole: string): boolean => {
  return hasPermission(userRole, ROLES.EDITOR);
};

export const canCreateArticles = (userRole: string): boolean => {
  return hasPermission(userRole, ROLES.CONTRIBUTOR);
};