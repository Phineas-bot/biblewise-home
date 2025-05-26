import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';
import { AuthProvider } from '@/contexts/AuthContext'; // To provide useAuth hook
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Mocks
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null, // Simulate no user logged in initially
    isLoading: false,
  }),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }: { to: string }) => {
    // mockNavigate(to); // This might cause issues if Navigate component itself calls navigate
    return `Redirected to ${to}`;
  },
}));


const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockResetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;
const mockToast = jest.fn();

// Wrapper to provide necessary context
const renderAuthPage = () => {
  (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  return render(
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider is needed if Auth component uses useAuth internally, which it does */}
        <Auth />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Auth.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign Up', () => {
    it('renders sign-up form and successfully signs up a user', async () => {
      mockSignUp.mockResolvedValueOnce({ data: {}, error: null });
      renderAuthPage();

      // Switch to Sign Up form
      fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
      
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: { data: { full_name: 'Test User' } },
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sign-up successful!',
        description: 'Please check your email (including spam folder) for a confirmation link to activate your account.',
        duration: 9000,
      });
      // Check if form switches to login (setIsSignUp(false))
      expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
    });

    it('shows error toast on sign-up failure', async () => {
      const errorMessage = 'User already registered';
      mockSignUp.mockResolvedValueOnce({ data: {}, error: { message: errorMessage } });
      renderAuthPage();

      fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sign-up error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('validates empty fields for sign-up', async () => {
        renderAuthPage();
        fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Validation Error",
                description: "Please fill in all fields for sign-up.",
                variant: "destructive",
            });
        });
        expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    it('renders login form and successfully logs in a user', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ data: {}, error: null });
      renderAuthPage();

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login successful!',
        description: 'Welcome back to Bible Correspondence Course.',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows error toast on login failure', async () => {
      const errorMessage = 'Invalid login credentials';
      mockSignInWithPassword.mockResolvedValueOnce({ data: {}, error: { message: errorMessage } });
      renderAuthPage();

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });
    
    it('validates empty fields for login', async () => {
        renderAuthPage();
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Validation Error",
                description: "Email and password are required.",
                variant: "destructive",
            });
        });
        expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('Password Reset', () => {
    it('renders password reset form and successfully requests a password reset', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });
      renderAuthPage();

      // Switch to Forgot Password mode
      fireEvent.click(screen.getByRole('button', { name: /Forgot Password\?/i }));
      
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument(); // Password field should be hidden

      fireEvent.change(screen.getByLabelText(/Enter your Email Address/i), { target: { value: 'reset@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('reset@example.com', {
          redirectTo: `${window.location.origin}/update-password`,
        });
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Password Reset Link Sent',
        description: 'Please check your email (including spam folder) for a link to reset your password.',
        duration: 9000,
      });
      // Check if form switches back to login
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('shows error toast on password reset failure', async () => {
      const errorMessage = 'User not found';
      mockResetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: { message: errorMessage } });
      renderAuthPage();
      
      fireEvent.click(screen.getByRole('button', { name: /Forgot Password\?/i }));
      fireEvent.change(screen.getByLabelText(/Enter your Email Address/i), { target: { value: 'unknown@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Password Reset Error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });
    
    it('validates empty email for password reset', async () => {
        renderAuthPage();
        fireEvent.click(screen.getByRole('button', { name: /Forgot Password\?/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Validation Error",
                description: "Email is required to reset password.",
                variant: "destructive",
            });
        });
        expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
    });
  });

  describe('Form Switching', () => {
    it('switches between Sign In and Sign Up forms and resets fields', () => {
      renderAuthPage();
      
      // Initial: Sign In form
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');

      // Switch to Sign Up
      fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(emailInput).toHaveValue(''); // Fields should reset

      // Switch back to Sign In
      fireEvent.click(screen.getByRole('button', { name: /Already have an account\? Sign In/i }));
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
      expect(emailInput).toHaveValue(''); // Fields should reset
    });

    it('switches from Sign In to Forgot Password and back, resetting fields', () => {
        renderAuthPage();
        
        // Initial: Sign In form
        const emailInput = screen.getByLabelText(/Email Address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Switch to Forgot Password
        fireEvent.click(screen.getByRole('button', { name: /Forgot Password\?/i }));
        expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
        expect(emailInput).toHaveValue(''); // Email field should reset

        // Switch back to Sign In
        fireEvent.click(screen.getByRole('button', { name: /Back to Sign In/i }));
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(emailInput).toHaveValue(''); // Email field should reset
    });
  });
});
