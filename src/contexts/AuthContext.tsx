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
      const { data, error } = await DatabaseService.getProfile(userId);
      if (error) {
        console.error('❌ AuthContext: Error fetching profile:', error);
      } else if (data) {
        console.log('✅ AuthContext: Profile fetched successfully:', {
          name: data.full_name,
          role: data.role,
          active: data.is_active
        });
        setProfile(data);
      } else {
        console.warn('⚠️ AuthContext: No profile data returned');
      }
    } catch (error) {
      console.error('❌ AuthContext: Catch error in fetchProfile:', error);
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
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
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