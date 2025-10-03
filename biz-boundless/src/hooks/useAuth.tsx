import { useState, useEffect } from 'react'import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

import type { User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase/client'import { type User } from '@supabase/supabase-js';



interface UseAuthResult {import { supabase } from '@/lib/supabase/client';import { type User } from '@supabase/supabase-js';

  user: User | null

  loading: boolean

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>

  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>interface UseAuthResult {import { supabase } from '@/lib/supabase/client';import { type User } from '@supabase/supabase-js';

  signOut: () => Promise<void>

}  user: User | null;



export function useAuth(): UseAuthResult {  loading: boolean;

  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;



  useEffect(() => {  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;interface UseAuthResult {import { supabase } from '@/lib/supabase/client';import { supabase } from '@/lib/supabase/client';

    // Check for an active session

    const checkSession = async () => {  signOut: () => Promise<void>;

      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user ?? null)}  user: User | null;

      setLoading(false)

    }



    // Listen for auth changesexport function useAuth(): UseAuthResult {  loading: boolean;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

      setUser(session?.user ?? null)  const [user, setUser] = useState<User | null>(null);

      setLoading(false)

    })  const [loading, setLoading] = useState(true);  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;



    // Initial session check

    checkSession()

  useEffect(() => {  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;interface UseAuthResult {import { type User } from '@supabase/supabase-js';import { supabase } from '@/lib/supabase/client';import { User, Session } from '@supabase/supabase-js';

    // Cleanup

    return () => subscription.unsubscribe()    // Check for an active session

  }, [])

    const checkSession = async () => {  signOut: () => Promise<void>;

  const signIn = async (email: string, password: string) => {

    try {      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.auth.signInWithPassword({

        email,      setUser(session?.user ?? null);}  user: User | null;

        password

      })      setLoading(false);

      return { error }

    } catch (error) {    };

      return { error: error as Error }

    }

  }

    // Listen for auth changesexport function useAuth(): UseAuthResult {  loading: boolean;

  const signUp = async (email: string, password: string, fullName: string, role: string) => {

    try {    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

      const { error } = await supabase.auth.signUp({

        email,      setUser(session?.user ?? null);  const [user, setUser] = useState<User | null>(null);

        password,

        options: {      setLoading(false);

          data: {

            full_name: fullName,    });  const [loading, setLoading] = useState(true);  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;

            role

          }

        }

      })    // Initial session check

      return { error }

    } catch (error) {    checkSession();

      return { error: error as Error }

    }  useEffect(() => {  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;interface Profile {import { type User } from '@supabase/supabase-js';import { supabase } from '@/integrations/supabase/client';

  }

    // Cleanup

  const signOut = async () => {

    try {    return () => subscription.unsubscribe();    // Check for an active session

      await supabase.auth.signOut()

    } catch (error) {  }, []);

      console.error('Error signing out:', error)

    }    const checkSession = async () => {  signOut: () => Promise<void>;

  }

  const signIn = async (email: string, password: string) => {

  return {

    user,    try {      const { data: { session } } = await supabase.auth.getSession();

    loading,

    signIn,      const { error } = await supabase.auth.signInWithPassword({

    signUp,

    signOut        email,      setUser(session?.user ?? null);}  id: string;

  }

}        password

      });      setLoading(false);

      return { error };

    } catch (error) {    };

      return { error: error as Error };

    }

  };

    // Listen for auth changesexport function useAuth(): UseAuthResult {  created_at: string;

  const signUp = async (email: string, password: string, fullName: string, role: string) => {

    try {    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

      const { error } = await supabase.auth.signUp({

        email,      setUser(session?.user ?? null);  const [user, setUser] = useState<User | null>(null);

        password,

        options: {      setLoading(false);

          data: {

            full_name: fullName,    });  const [loading, setLoading] = useState(true);  updated_at: string;

            role

          }

        }

      });    // Initial session check

      return { error };

    } catch (error) {    checkSession();

      return { error: error as Error };

    }  useEffect(() => {  full_name: string;interface UseAuthResult {interface Profile {

  };

    // Cleanup

  const signOut = async () => {

    try {    return () => subscription.unsubscribe();    // Check for an active session

      await supabase.auth.signOut();

    } catch (error) {  }, []);

      console.error('Error signing out:', error);

    }    const checkSession = async () => {  role: string;

  };

  const signIn = async (email: string, password: string) => {

  return {

    user,    try {      const { data: { session } } = await supabase.auth.getSession();

    loading,

    signIn,      const { error } = await supabase.auth.signInWithPassword({

    signUp,

    signOut        email,      setUser(session?.user ?? null);}  user: User | null;  id: string;

  };

}        password

      });      setLoading(false);

      return { error };

    } catch (error) {    };

      return { error: error as Error };

    }

  };

    // Listen for auth changesinterface UseAuthResult {  loading: boolean;  user_id: string;

  const signUp = async (email: string, password: string, fullName: string, role: string) => {

    try {    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

      const { error } = await supabase.auth.signUp({

        email,      setUser(session?.user ?? null);  user: User | null;

        password,

        options: {      setLoading(false);

          data: {

            full_name: fullName,    });  loading: boolean;  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;  full_name: string;

            role

          }

        }

      });    // Initial session check  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;

      return { error };

    } catch (error) {    checkSession();

      return { error: error as Error };

    }  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>;  role: 'admin' | 'employee';

  };

    // Cleanup

  const signOut = async () => {

    try {    return () => subscription.unsubscribe();  signOut: () => Promise<void>;

      await supabase.auth.signOut();

    } catch (error) {  }, []);

      console.error('Error signing out:', error);

    }}  signOut: () => Promise<void>;  phone?: string;

  };

  const signIn = async (email: string, password: string) => {

  return {

    user,    try {

    loading,

    signIn,      const { error } = await supabase.auth.signInWithPassword({

    signUp,

    signOut        email,export function useAuth(): UseAuthResult {}  is_active: boolean;

  };

}        password,

      });  const [user, setUser] = useState<User | null>(null);

      return { error };

    } catch (error) {  const [loading, setLoading] = useState(false);}

      return { error: error as Error };

    }

  };

  useEffect(() => {export function useAuth(): UseAuthResult {

  const signUp = async (email: string, password: string, fullName: string, role: string) => {

    try {    // Check for an active session

      const { error } = await supabase.auth.signUp({

        email,    const checkSession = async () => {  const [user, setUser] = useState<User | null>(null);interface AuthContextType {

        password,

        options: {      const { data: { session } } = await supabase.auth.getSession();

          data: {

            full_name: fullName,      setUser(session?.user ?? null);  const [loading, setLoading] = useState(true);  user: User | null;

            role,

          }      setLoading(false);

        }

      });    };  session: Session | null;

      return { error };

    } catch (error) {

      return { error: error as Error };

    }    // Listen for auth changes  useEffect(() => {  profile: Profile | null;

  };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

  const signOut = async () => {

    try {      setUser(session?.user ?? null);    // Check active sessions and sets the user  loading: boolean;

      await supabase.auth.signOut();

    } catch (error) {      setLoading(false);

      console.error('Error signing out:', error);

    }    });    supabase.auth.getSession().then(({ data: { session } }) => {  signIn: (email: string, password: string) => Promise<{ error: any }>;

  };



  return {

    user,    // Initial session check      setUser(session?.user ?? null);  signUp: (email: string, password: string, full_name: string, role?: 'admin' | 'employee') => Promise<{ error: any }>;

    loading,

    signIn,    checkSession();

    signUp,

    signOut      setLoading(false);  signOut: () => Promise<void>;

  };

}    // Cleanup

    return () => subscription.unsubscribe();    });  isAdmin: boolean;

  }, []);

}

  const signIn = async (email: string, password: string) => {

    try {    // Listen for changes on auth state (signed in, signed out, etc.)

      const { error } = await supabase.auth.signInWithPassword({

        email,    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {const AuthContext = createContext<AuthContextType | undefined>(undefined);

        password,

      });      setUser(session?.user ?? null);

      return { error };

    } catch (error) {      setLoading(false);export const AuthProvider = ({ children }: { children: ReactNode }) => {

      return { error: error as Error };

    }    });  const [user, setUser] = useState<User | null>(null);

  };

  const [session, setSession] = useState<Session | null>(null);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {

    try {    return () => subscription.unsubscribe();  const [profile, setProfile] = useState<Profile | null>(null);

      const { error } = await supabase.auth.signUp({

        email,  }, []);  const [loading, setLoading] = useState(false);

        password,

        options: {

          data: {

            full_name: fullName,  const signIn = async (email: string, password: string) => {  useEffect(() => {

            role,

          }    try {    console.log('AuthProvider mounted');

        }

      });      const { error } = await supabase.auth.signInWithPassword({    // Set up auth state listener

      return { error };

    } catch (error) {        email,    const { data: { subscription } } = supabase.auth.onAuthStateChange(

      return { error: error as Error };

    }        password      async (event, session) => {

  };

      });        console.log('Auth state changed:', event, session);

  const signOut = async () => {

    try {      return { error };        setSession(session);

      await supabase.auth.signOut();

    } catch (error) {    } catch (error) {        setUser(session?.user ?? null);

      console.error('Error signing out:', error);

    }      return { error: error as Error };        

  };

    }        if (session?.user) {

  return {

    user,  };          // Fetch user profile

    loading,

    signIn,          setTimeout(async () => {

    signUp,

    signOut  const signUp = async (email: string, password: string, fullName: string, role: string) => {            const { data: profileData } = await supabase

  };

}    try {              .from('profiles')

      const { error } = await supabase.auth.signUp({              .select('*')

        email,              .eq('user_id', session.user.id)

        password,              .single();

        options: {            

          data: {            setProfile(profileData);

            full_name: fullName,            setLoading(false);

            role: role,          }, 0);

          }        } else {

        }          setProfile(null);

      });          setLoading(false);

      return { error };        }

    } catch (error) {      }

      return { error: error as Error };    );

    }

  };    // Check for existing session

    supabase.auth.getSession().then(({ data: { session } }) => {

  const signOut = async () => {      setSession(session);

    try {      setUser(session?.user ?? null);

      await supabase.auth.signOut();      

    } catch (error) {      if (session?.user) {

      console.error('Error signing out:', error);        // Fetch user profile

    }        setTimeout(async () => {

  };          const { data: profileData } = await supabase

            .from('profiles')

  return {            .select('*')

    user,            .eq('user_id', session.user.id)

    loading,            .single();

    signIn,          

    signUp,          setProfile(profileData);

    signOut          setLoading(false);

  };        }, 0);

}      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, full_name: string, role: 'admin' | 'employee' = 'employee') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name,
          role
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
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