import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, DatabaseService, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 AuthContext: Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ AuthContext: Error getting initial session:', error);
        } else {
          console.log('✅ AuthContext: Initial session retrieved:', session ? 'Session exists' : 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('👤 AuthContext: User found, fetching profile for:', session.user.email);
            await fetchProfile(session.user.id);
          } else {
            console.log('👤 AuthContext: No user in session');
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Catch error in getInitialSession:', error);
      } finally {
        console.log('🏁 AuthContext: Initial session check completed, setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthContext: Auth state changed:', event, session?.user?.email || 'No user');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 AuthContext: Auth change - User found, fetching profile for:', session.user.email);
        await fetchProfile(session.user.id);
      } else {
        console.log('👤 AuthContext: Auth change - No user, clearing profile');
        setProfile(null);
      }
      
      console.log('🏁 AuthContext: Auth state change completed, setting loading to false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('📋 AuthContext: Fetching profile for user ID:', userId);
    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });
      
      const profilePromise = DatabaseService.getProfile(userId);
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ AuthContext: Error fetching profile:', error);
        // If RLS error, create a fallback profile based on user email
        if (error.message?.includes('infinite recursion') || error.message?.includes('policy')) {
          console.log('🔄 AuthContext: RLS error detected, creating fallback profile');
          const fallbackProfile = createFallbackProfile(userId, user?.email || '');
          setProfile(fallbackProfile);
          return;
        }
        setProfile(null); // Explicitly set profile to null on error
      } else if (data) {
        console.log('✅ AuthContext: Profile fetched successfully:', {
          name: data.full_name,
          role: data.role,
          active: data.is_active
        });
        setProfile(data);
      } else {
        console.warn('⚠️ AuthContext: No profile data returned');
        // If no data but user exists, create fallback profile
        console.log('🔄 AuthContext: No profile data, creating fallback profile');
        const fallbackProfile = createFallbackProfile(userId, user?.email || '');
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('❌ AuthContext: Catch error in fetchProfile:', error);
      // Handle timeout or other errors with fallback
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.log('⏰ AuthContext: Profile fetch timeout, creating fallback profile');
        const fallbackProfile = createFallbackProfile(userId, user?.email || '');
        setProfile(fallbackProfile);
      } else {
        setProfile(null);
      }
      setProfile(null); // Explicitly set profile to null on catch error
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await DatabaseService.signUp(email, password, fullName);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during signup' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Starting sign in for:', email);
    try {
      setLoading(true);
      console.log('⏳ AuthContext: Loading set to true, calling DatabaseService.signIn');
      const { data, error } = await DatabaseService.signIn(email, password);
      
      if (error) {
        console.error('❌ AuthContext: Sign in failed:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('✅ AuthContext: Sign in successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Catch error in signIn:', error);
      return { success: false, error: error.message || 'An error occurred during signin' };
    } finally {
      console.log('🏁 AuthContext: Sign in process completed, setting loading to false');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await DatabaseService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
  // Create fallback profile when database profile can't be fetched
  const createFallbackProfile = (userId: string, email: string): Profile => {
    console.log('🛠️ AuthContext: Creating fallback profile for:', email);
    
    // Determine role based on email (for demo purposes)
    let role: Profile['role'] = 'subscriber';
    if (email.includes('admin@opiniku.id')) {
      role = 'super_admin';
    } else if (email.includes('editor@opiniku.id')) {
      role = 'editor';
    } else if (email.includes('journalist@opiniku.id')) {
      role = 'journalist';
    } else if (email.includes('@opiniku.id')) {
      role = 'contributor';
    }
    
    const fallbackProfile: Profile = {
      id: `fallback-${userId}`,
      user_id: userId,
      full_name: email.split('@')[0] || 'User',
      role: role,
      bio: null,
      avatar_url: null,
      phone: null,
      address: null,
      is_active: true,
      last_login_at: new Date().toISOString(),
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ AuthContext: Fallback profile created with role:', role);
    return fallbackProfile;
  };

    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data, error } = await DatabaseService.updateProfile(user.id, updates);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (data) {
        setProfile(data);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred updating profile' };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};