import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionPlans from '../SubscriptionPlans';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useStripe } from '@stripe/react-stripe-js'; // For mocking Stripe

// Mocks
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    // Mock other Supabase modules if SubscriptionPlans uses them directly
  },
}));

const mockUser = {
  id: 'user-test-id',
  email: 'user@example.com',
};
let mockAuthContextUser: any = mockUser; // Default to logged-in user

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAuthContextUser,
    isLoading: false,
  }),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock Stripe
const mockRedirectToCheckout = jest.fn();
jest.mock('@stripe/react-stripe-js', () => ({
  ...jest.requireActual('@stripe/react-stripe-js'), // Import and retain default exports
  useStripe: () => ({
    redirectToCheckout: mockRedirectToCheckout,
  }),
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock Elements provider
}));

const mockSupabaseInvoke = supabase.functions.invoke as jest.Mock;
const mockAppToast = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


const renderSubscriptionPlansPage = () => {
  (useToast as jest.Mock).mockReturnValue({ toast: mockAppToast });
  return render(
    <BrowserRouter>
      <AuthProvider> {/* Provide AuthContext */}
        <SubscriptionPlans />
      </AuthProvider>
    </BrowserRouter>
  );
};


describe('SubscriptionPlans.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextUser = mockUser; // Reset to logged-in state by default
  });

  it('renders plans and calls checkout for Single Course when user is logged in', async () => {
    mockSupabaseInvoke.mockResolvedValueOnce({ data: { sessionId: 'sess_123' }, error: null });
    mockRedirectToCheckout.mockResolvedValueOnce({ error: null });
    
    renderSubscriptionPlansPage();

    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedButtons[0]); // Assuming first "Get Started" is for Single Course

    await waitFor(() => {
      expect(mockSupabaseInvoke).toHaveBeenCalledWith('create-checkout-session', {
        body: {
          userId: mockUser.id,
          userEmail: mockUser.email,
          planId: 'course_single',
          amount: 999,
          currency: 'usd',
          mode: 'payment',
          metadata: { courseId: "general_course_purchase" },
        },
      });
    });
    
    expect(mockRedirectToCheckout).toHaveBeenCalledWith({ sessionId: 'sess_123' });
  });

  it('renders plans and calls checkout for Full Access Subscription (monthly) when user is logged in', async () => {
    mockSupabaseInvoke.mockResolvedValueOnce({ data: { sessionId: 'sess_456' }, error: null });
    mockRedirectToCheckout.mockResolvedValueOnce({ error: null });

    renderSubscriptionPlansPage();
    
    // Ensure monthly billing is selected (it's annual by default)
    const billingToggle = screen.getByRole('button', { name: /Pay Annually/i }); // The button for toggling
    fireEvent.click(billingToggle); // Click once to switch to Monthly

    const subscribeButtons = screen.getAllByRole('button', { name: /Subscribe Now/i });
    fireEvent.click(subscribeButtons[0]); // Assuming it's the only "Subscribe Now" button

    await waitFor(() => {
      expect(mockSupabaseInvoke).toHaveBeenCalledWith('create-checkout-session', {
        body: {
          userId: mockUser.id,
          userEmail: mockUser.email,
          planId: 'sub_full_monthly', // Switched to monthly
          amount: 899,
          currency: 'usd',
          mode: 'subscription',
          interval: 'month',
        },
      });
    });
    expect(mockRedirectToCheckout).toHaveBeenCalledWith({ sessionId: 'sess_456' });
  });
  
  it('calls checkout for Full Access Subscription (annual) when user is logged in and annual is selected', async () => {
    mockSupabaseInvoke.mockResolvedValueOnce({ data: { sessionId: 'sess_789' }, error: null });
    mockRedirectToCheckout.mockResolvedValueOnce({ error: null });

    renderSubscriptionPlansPage();
    
    // Annual billing is selected by default
    const subscribeButtons = screen.getAllByRole('button', { name: /Subscribe Now/i });
    fireEvent.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(mockSupabaseInvoke).toHaveBeenCalledWith('create-checkout-session', {
        body: {
          userId: mockUser.id,
          userEmail: mockUser.email,
          planId: 'sub_full_annual',
          amount: 7999,
          currency: 'usd',
          mode: 'subscription',
          interval: 'year',
        },
      });
    });
    expect(mockRedirectToCheckout).toHaveBeenCalledWith({ sessionId: 'sess_789' });
  });


  it('redirects to /auth and shows toast if user is not logged in when trying to checkout', () => {
    mockAuthContextUser = null; // Simulate logged-out user
    renderSubscriptionPlansPage();

    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedButtons[0]);

    expect(mockAppToast).toHaveBeenCalledWith({
      title: 'Sign in required',
      description: 'Please sign in to subscribe to a plan.',
      variant: 'destructive',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
    expect(mockSupabaseInvoke).not.toHaveBeenCalled();
  });

  it('shows error toast if Supabase function invocation fails', async () => {
    const errorMessage = 'Function invocation failed';
    mockSupabaseInvoke.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });
    
    renderSubscriptionPlansPage();

    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedButtons[0]);

    await waitFor(() => {
      expect(mockAppToast).toHaveBeenCalledWith({
        title: 'Checkout Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });
    expect(mockRedirectToCheckout).not.toHaveBeenCalled();
  });
  
  it('shows error toast if Stripe redirect fails', async () => {
    const stripeErrorMessage = 'Stripe redirect failed';
    mockSupabaseInvoke.mockResolvedValueOnce({ data: { sessionId: 'sess_123' }, error: null });
    mockRedirectToCheckout.mockResolvedValueOnce({ error: { message: stripeErrorMessage } });
    
    renderSubscriptionPlansPage();

    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedButtons[0]);

    await waitFor(() => {
      expect(mockAppToast).toHaveBeenCalledWith({
        title: 'Stripe Error',
        description: stripeErrorMessage,
        variant: 'destructive',
      });
    });
  });

  it('shows error toast if Stripe is not loaded', async () => {
    (useStripe as jest.Mock).mockReturnValueOnce(null); // Simulate Stripe not loaded
    
    renderSubscriptionPlansPage();

    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedButtons[0]);

    await waitFor(() => {
      expect(mockAppToast).toHaveBeenCalledWith({
        title: 'Stripe not loaded',
        description: 'Stripe.js has not loaded yet. Please try again in a moment.',
        variant: 'destructive',
      });
    });
    expect(mockSupabaseInvoke).not.toHaveBeenCalled();
  });

  it('toggles between annual and monthly billing and updates price display', () => {
    renderSubscriptionPlansPage();

    // Initially Annual
    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByText('Per year, billed annually')).toBeInTheDocument();

    // Toggle to Monthly
    const billingToggle = screen.getByRole('button', { name: /Pay Annually/i });
    fireEvent.click(billingToggle);
    
    expect(screen.getByText('$8.99')).toBeInTheDocument();
    expect(screen.getByText('Per month, billed monthly')).toBeInTheDocument();

    // Toggle back to Annual
    fireEvent.click(billingToggle);
    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByText('Per year, billed annually')).toBeInTheDocument();
  });
});
