
import { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types"; // Import generated types

// Define a more specific type for active purchases, based on the generated Row type
export type ActiveUserPurchase = Pick<
  Tables<"user_purchases">,
  "item_id" | "item_type" | "purchase_status" | "subscription_end_date" | "id"
>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  userPurchases: ActiveUserPurchase[] | null;
  isLoadingPurchases: boolean;
  fetchUserPurchases: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  userPurchases: null,
  isLoadingPurchases: false,
  fetchUserPurchases: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPurchases, setUserPurchases] = useState<ActiveUserPurchase[] | null>(null);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  const fetchUserPurchases = useCallback(async () => {
    if (!user) {
      setUserPurchases(null); // Clear purchases if no user
      return;
    }

    setIsLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from("user_purchases")
        .select("id, item_id, item_type, purchase_status, subscription_end_date")
        .eq("user_id", user.id)
        .eq("purchase_status", "completed");
        // The subscription_end_date check needs to be more nuanced.
        // We want records where:
        // 1. item_type is 'course' (lifetime access, subscription_end_date might be NULL)
        // 2. item_type is 'subscription_plan' AND subscription_end_date IS NULL (less common, but could mean indefinite)
        // 3. item_type is 'subscription_plan' AND subscription_end_date > NOW()

      if (error) {
        console.error("Error fetching user purchases:", error.message);
        setUserPurchases(null);
      } else {
        const activePurchases = data.filter(purchase => {
          if (purchase.item_type === 'course') {
            return true; // Courses are typically lifetime access once purchased
          }
          if (purchase.item_type === 'subscription_plan') {
            return !purchase.subscription_end_date || new Date(purchase.subscription_end_date) > new Date();
          }
          return false;
        });
        setUserPurchases(activePurchases as ActiveUserPurchase[]);
      }
    } catch (e: any) {
      console.error("Exception fetching user purchases:", e.message);
      setUserPurchases(null);
    } finally {
      setIsLoadingPurchases(false);
    }
  }, [user]); // Depends on user object

  useEffect(() => {
    // Get session from local storage
    const setSessionAndFetchData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setIsLoading(false); // Initial loading of session done

      if (currentUser) {
        await fetchUserPurchases(); // Fetch purchases if user is available
      } else {
        setUserPurchases(null); // Clear purchases if no user
      }
    };

    setSessionAndFetchData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth event: ${event}`);
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        setIsLoading(false); // Auth state change loading done

        if (event === "SIGNED_IN" && newUser) {
          await fetchUserPurchases();
        } else if (event === "SIGNED_OUT") {
          setUserPurchases(null); // Clear purchases on sign out
        }
        // Consider if purchases should be refetched on TOKEN_REFRESHED
        // if (event === "TOKEN_REFRESHED" && newUser) {
        //   await fetchUserPurchases();
        // }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserPurchases]); // Add fetchUserPurchases to dependency array

  const signOut = async () => {
    setIsLoading(true); // You might want a specific isLoadingAuth or similar
    await supabase.auth.signOut();
    // setUser and setSession will be updated by onAuthStateChange listener
    // which will also clear userPurchases
    // setIsLoading(false); // This might be set too early
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    userPurchases,
    isLoadingPurchases,
    fetchUserPurchases,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
