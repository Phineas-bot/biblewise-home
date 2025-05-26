import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(), // for the second .eq("purchase_status", "completed")
        })),
      })),
    })),
  },
}));

const mockUser: User = {
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  user: mockUser,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementation for getSession
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    // Default mock for from().select().eq().eq() chain
    (supabase.from('user_purchases').select().eq as jest.Mock).mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
    });
  });

  it('should initialize with no user and session', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(true); // Initially true, then false after getSession
    expect(result.current.userPurchases).toBeNull();
    expect(result.current.isLoadingPurchases).toBe(false);
  });

  it('should fetch session and user on mount', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Wait for useEffect to run and state to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow microtasks to run
    });
    
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  describe('fetchUserPurchases', () => {
    const mockCoursePurchase = {
      id: 1,
      item_id: 'course_101',
      item_type: 'course',
      purchase_status: 'completed',
      subscription_end_date: null,
    };
    const mockActiveSubscription = {
      id: 2,
      item_id: 'sub_monthly',
      item_type: 'subscription_plan',
      purchase_status: 'completed',
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Active for 30 more days
    };
    const mockExpiredSubscription = {
      id: 3,
      item_id: 'sub_annual_expired',
      item_type: 'subscription_plan',
      purchase_status: 'completed',
      subscription_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
    };
     const mockPendingPurchase = {
      id: 4,
      item_id: 'course_102',
      item_type: 'course',
      purchase_status: 'pending',
      subscription_end_date: null,
    };


    it('should call supabase.from with correct parameters', async () => {
      // Setup session for user
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      // Wait for initial session and user to be set
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });

      // Manually call fetchUserPurchases
      await act(async () => {
        await result.current.fetchUserPurchases();
      });

      expect(supabase.from).toHaveBeenCalledWith('user_purchases');
      const selectMock = supabase.from('user_purchases').select();
      expect(selectMock).toHaveBeenCalledWith('id, item_id, item_type, purchase_status, subscription_end_date');
      const eqUserMock = (selectMock as any).eq(); // First eq
      expect(eqUserMock).toHaveBeenCalledWith('user_id', mockUser.id);
      const eqStatusMock = (eqUserMock as any).eq(); // Second eq
      expect(eqStatusMock).toHaveBeenCalledWith('purchase_status', 'completed');
    });

    it('should correctly filter active purchases and update state', async () => {
       (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      // Mock the response from Supabase
      const mockSupabaseResponse = {
        data: [mockCoursePurchase, mockActiveSubscription, mockExpiredSubscription, mockPendingPurchase],
        error: null,
      };
      (supabase.from('user_purchases').select().eq('user_id', mockUser.id).eq as jest.Mock)
        .mockResolvedValue(mockSupabaseResponse);
      
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); }); // for session
      
      expect(result.current.isLoadingPurchases).toBe(false); // Initial state

      await act(async () => {
        await result.current.fetchUserPurchases();
      });
      
      expect(result.current.isLoadingPurchases).toBe(false);
      expect(result.current.userPurchases).toHaveLength(2);
      expect(result.current.userPurchases).toEqual(
        expect.arrayContaining([
          expect.objectContaining(mockCoursePurchase), // Courses are always active if completed
          expect.objectContaining(mockActiveSubscription), // Active subscription
        ])
      );
      expect(result.current.userPurchases).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining(mockExpiredSubscription),
          expect.objectContaining(mockPendingPurchase) // Not 'completed' status
        ])
      );
    });

    it('should handle error when fetching purchases', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      const mockError = { message: 'Failed to fetch purchases' };
      (supabase.from('user_purchases').select().eq('user_id', mockUser.id).eq as jest.Mock)
        .mockResolvedValue({ data: null, error: mockError });

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); }); // for session

      await act(async () => {
        await result.current.fetchUserPurchases();
      });

      expect(result.current.userPurchases).toBeNull();
      expect(result.current.isLoadingPurchases).toBe(false);
      // Optionally, check console.error if you log errors there
    });
    
    it('should clear purchases if no user is present', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession }, // Initially has a user
        error: null,
      });
      (supabase.from('user_purchases').select().eq().eq as jest.Mock)
        .mockResolvedValue({ data: [mockCoursePurchase], error: null });

      const { result, rerender } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
      await act(async () => { await result.current.fetchUserPurchases(); });
      
      expect(result.current.userPurchases).not.toBeNull();

      // Simulate user logging out (session becomes null)
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
      // Simulate onAuthStateChange firing with no user
      const onAuthStateChangeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await act(async () => {
        onAuthStateChangeCallback('SIGNED_OUT', null);
      });
      
      // After SIGNED_OUT, userPurchases should be null
      expect(result.current.user).toBeNull();
      expect(result.current.userPurchases).toBeNull();
      
      // Further calls to fetchUserPurchases should do nothing if user is null
      await act(async () => {
        await result.current.fetchUserPurchases();
      });
       expect(supabase.from('user_purchases').select().eq().eq).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  it('should update session and user on SIGNED_IN event and fetch purchases', async () => {
    const onAuthStateChangeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      onAuthStateChangeCallback('SIGNED_IN', mockSession);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockUser);
    expect(supabase.from('user_purchases').select().eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('should clear session, user, and purchases on SIGNED_OUT event', async () => {
    // First, sign in
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });
    (supabase.from('user_purchases').select().eq().eq as jest.Mock)
        .mockResolvedValueOnce({ data: [{}], error: null }); // Some purchase data

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    await act(async () => { await result.current.fetchUserPurchases(); });


    expect(result.current.session).toEqual(mockSession);
    expect(result.current.userPurchases).not.toBeNull();

    // Then, sign out
    const onAuthStateChangeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
    await act(async () => {
      onAuthStateChangeCallback('SIGNED_OUT', null);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.userPurchases).toBeNull();
  });
});
