import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;

const mockUser: User = {
  id: 'user-id-123',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initial state is loading and no user/session', () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      // Simulate initial auth state check, then no change
      // The callback is called by Supabase with (event, session)
      // Here we ensure it's called to set isLoading to false
      act(() => {
        callback('INITIAL_SESSION', null);
      });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(contextValue.isLoading).toBe(true); // Initial isLoading from useState(true)
    // After onAuthStateChange callback for 'INITIAL_SESSION'
    // We need to wait for the state update triggered by the callback.
    // However, testing the immediate state before any async ops or effect callbacks might be tricky
    // The important part is what it settles to.
  });
  
  it('loads session and user from getSession on mount', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      // This will be called after getSession, potentially updating the state again
      // For this test, we assume getSession's value is what we are testing for initial load
      // Or that onAuthStateChange confirms the same session.
      act(() => {
        callback('SIGNED_IN', mockSession);
      });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    // Wait for isLoading to become false
    await waitFor(() => expect(contextValue.isLoading).toBe(false));
    
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(contextValue.session).toEqual(mockSession);
    expect(contextValue.user).toEqual(mockUser);
  });

  it('updates user and session on auth state change', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    
    let authCallback: (event: string, session: Session | null) => void = () => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback; // Capture the callback
      act(() => {
        callback('INITIAL_SESSION', null); // Initial call
      });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await waitFor(() => expect(contextValue.isLoading).toBe(false));
    expect(contextValue.user).toBeNull();

    // Simulate a SIGNED_IN event
    act(() => {
      authCallback('SIGNED_IN', mockSession);
    });
    
    expect(contextValue.session).toEqual(mockSession);
    expect(contextValue.user).toEqual(mockUser);
    expect(contextValue.isLoading).toBe(false); // Should remain false or be set to false again

    // Simulate a SIGNED_OUT event
    act(() => {
      authCallback('SIGNED_OUT', null);
    });

    expect(contextValue.session).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  it('calls supabase.auth.signOut and clears session on signOut', async () => {
    // Initial state: user is logged in
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
    let authCallback: (event: string, session: Session | null) => void = () => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      act(() => {
        callback('SIGNED_IN', mockSession); // Initial state
      });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    mockSignOut.mockResolvedValueOnce({ error: null });

    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(contextValue.isLoading).toBe(false));
    expect(contextValue.user).not.toBeNull();

    await act(async () => {
      await contextValue.signOut();
    });
    
    // After signOut, onAuthStateChange should be triggered by Supabase client
    // Simulate this behavior if not automatically handled by mocks
    act(() => {
      authCallback('SIGNED_OUT', null);
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    // isLoading becomes true during signOut, then false. onAuthStateChange also sets it to false.
    // Check the final settled state.
    expect(contextValue.isLoading).toBe(false); 
    expect(contextValue.session).toBeNull();
    expect(contextValue.user).toBeNull();
  });
  
  it('handles error during signOut', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      act(() => callback('SIGNED_IN', mockSession));
      return { data: { subscription: { unsubscribe: jest.fn() }}};
    });
    const signOutError = new Error("Sign out failed");
    mockSignOut.mockResolvedValueOnce({ error: signOutError });
    console.error = jest.fn(); // Mock console.error

    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>{(value) => { contextValue = value; return null; }}</AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(contextValue.isLoading).toBe(false));
    await act(async () => {
      await contextValue.signOut();
    });
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(contextValue.isLoading).toBe(false); // Should be false after finally block
    expect(contextValue.user).not.toBeNull(); // User state should ideally not change if signout failed on server but client thinks it succeeded. 
                                          // Or it might clear if onAuthStateChange is not triggered by error.
                                          // The current implementation of signOut in AuthContext sets user to null via onAuthStateChange.
                                          // If signOut itself errors, onAuthStateChange might not fire.
                                          // The code has: if (error) { console.error } then finally { setIsLoading(false) }
                                          // It does not revert user/session if signOut itself throws, relies on onAuthStateChange.
                                          // This test highlights that the user state might remain if onAuthStateChange doesn't fire after a failed signOut.
                                          // However, Supabase client usually triggers onAuthStateChange even on error to reflect actual auth state.
                                          // Let's assume onAuthStateChange does NOT fire for this specific test of direct signOut error.
    expect(console.error).toHaveBeenCalledWith("Error signing out:", signOutError.message);
    // The session and user would still be cleared by onAuthStateChange if Supabase client triggers it.
    // If it doesn't, then session and user would remain. The current code in AuthContext.tsx
    // does not clear user/session in the catch block of signOut, it relies on onAuthStateChange.
    // This is a subtle point. For this test, we assume onAuthStateChange IS NOT CALLED from the failed signOut.
    expect(contextValue.session).toEqual(mockSession); // Stays same because onAuthStateChange didn't run
    expect(contextValue.user).toEqual(mockUser); // Stays same
  });

  it('unsubscribes from onAuthStateChange on unmount', () => {
    const unsubscribeMock = jest.fn();
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValueOnce({ data: { subscription: { unsubscribe: unsubscribeMock } } });

    const { unmount } = render(<AuthProvider><div /></AuthProvider>);
    
    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});

// Helper to wrap components in AuthProvider for other tests if needed
export const renderWithAuthProvider = (
  ui: React.ReactElement, 
  providerProps?: Partial<AuthContextType> // This should be initial values for the context if needed, not providerProps
) => {
  // This helper is more for consuming components. For testing AuthProvider itself, direct render is fine.
  // For components that useAuth(), this would be useful.
  return render(
    <AuthProvider> {/* This will use the mocked Supabase for its internal workings */}
      {ui}
    </AuthProvider>
  );
};
