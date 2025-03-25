
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

// Define user types
export type UserRole = 'student' | 'reception' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'with session' : 'no session');
        setIsLoading(true);
        if (session && session.user) {
          console.log('Session exists, fetching profile...');
          await fetchUserProfile(session.user);
        } else {
          console.log('No session, clearing user');
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      console.log('Initializing auth, checking for existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        console.log('Existing session found, fetching profile...');
        await fetchUserProfile(session.user);
      } else {
        console.log('No existing session found');
      }
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data from the database
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', supabaseUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('Profile data retrieved:', data);
        setUser({
          id: supabaseUser.id,
          name: data.name || 'Unknown User',
          email: data.email || supabaseUser.email || '',
          role: data.role as UserRole,
          department: data.department || undefined,
          profileImage: data.profile_image || undefined,
        });
      } else {
        console.log('No profile found for user:', supabaseUser.id);
        toast({
          title: 'Profile not found',
          description: 'Your user profile could not be retrieved.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error from Supabase:', error);
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      if (data.user) {
        console.log('Auth successful, fetching user profile...');
        await fetchUserProfile(data.user);
        toast({
          title: 'Login successful',
          description: 'Welcome to BITS Hostel Management',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      console.log('Starting signup for:', email);
      // First, determine the role based on email
      let role: UserRole = 'student';
      
      if (email === 'reception@bits.ac.in') {
        role = 'reception';
      } else if (email === 'admin@bits.ac.in') {
        role = 'admin';
      }

      console.log('Determined role:', role);

      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          },
        },
      });

      if (error) {
        console.error('Signup error from Supabase:', error);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Signup successful, user created:', data.user?.id);

      // If signup is successful, manually create the profile
      if (data.user) {
        console.log('Creating profile for new user...');
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            title: 'Profile creation failed',
            description: 'Your account was created but profile setup failed.',
            variant: 'destructive',
          });
        } else {
          console.log('Profile created successfully');
        }
      }

      toast({
        title: 'Sign up successful',
        description: 'Please check your email to confirm your account',
      });

    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error from Supabase:', error);
        throw error;
      }
      setUser(null);
      console.log('Logout successful');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
