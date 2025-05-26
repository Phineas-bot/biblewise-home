
import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session from local storage
    const setSessionFromLocalStorage = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
          // Potentially set user-facing error state here if needed
        }
        // Set session and user, but let onAuthStateChange handle initial isLoading
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error: any) {
        console.error("Error in setSessionFromLocalStorage:", error.message);
        // setIsLoading(false) here could be an option if we don't rely on onAuthStateChange for initial load
      }
    };

    setSessionFromLocalStorage();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log(`Auth event: ${event}`); // Removed console.log
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false); // This will be called on initial load and subsequent changes
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        // Potentially set user-facing error state here
      }
    } catch (error: any) {
      console.error("Error in signOut:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
