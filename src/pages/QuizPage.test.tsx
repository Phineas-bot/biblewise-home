import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams, useNavigate, MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import QuizPage from './QuizPage';
import { ActiveUserPurchase } from '@/contexts/AuthContext';
import { quizzes } from '@/data/quizData'; // Using actual quiz data
import { supabase } from '@/integrations/supabase/client';

// Mock hooks and Supabase client
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('@/hooks/useAuth');
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }), // Default successful insert
    })),
  },
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseParams = useParams as jest.Mock;
const mockNavigate = jest.fn();
const mockSupabaseFrom = supabase.from as jest.Mock;
const mockInsert = jest.fn().mockResolvedValue({ error: null });

// Helper to render with router context
const renderWithRouter = (ui: React.ReactElement, { route = '/', path = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('QuizPage', () => {
  const testQuiz = quizzes[0]; // Use the first quiz from actual data
  const user = { id: 'user123', email: 'test@example.com' };
  const session = { user, access_token: 'token', expires_in: 3600, token_type: 'bearer', refresh_token: 'refresh', expires_at: Date.now() + 3600000 };


  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockUseParams.mockReturnValue({ id: testQuiz.id.toString() });
    mockUseAuth.mockReturnValue({
      user: null,
      userPurchases: null,
      isLoading: false,
      isLoadingPurchases: false,
      session: null,
      fetchUserPurchases: jest.fn(), // Mock if it's called internally on some scenarios
    });
    mockNavigate.mockClear();
    mockInsert.mockClear();
    mockSupabaseFrom.mockReturnValue({ insert: mockInsert }); // Reset insert mock for each test
  });

  describe('Access Control', () => {
    it('should show loading state if isLoadingAuth is true', () => {
      mockUseAuth.mockReturnValueOnce({ user, session, isLoading: true, isLoadingPurchases: false });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      expect(screen.getByText(/Loading quiz and checking access.../i)).toBeInTheDocument();
    });
    
    it('should show loading state if isLoadingPurchases is true', () => {
      mockUseAuth.mockReturnValueOnce({ user, session, isLoading: false, isLoadingPurchases: true });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      expect(screen.getByText(/Loading quiz and checking access.../i)).toBeInTheDocument();
    });

    it('should grant access if user has purchased the course', async () => {
      const purchases: ActiveUserPurchase[] = [
        { id: 1, item_id: testQuiz.courseId.toString(), item_type: 'course', purchase_status: 'completed', subscription_end_date: null }
      ];
      mockUseAuth.mockReturnValue({ user, session, userPurchases: purchases, isLoading: false, isLoadingPurchases: false });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      await waitFor(() => expect(screen.getByText(testQuiz.title)).toBeInTheDocument());
      expect(screen.getByText('Begin Quiz')).toBeInTheDocument();
    });

    it('should grant access if user has an active subscription', async () => {
      const purchases: ActiveUserPurchase[] = [
        { id: 2, item_id: 'sub_plan', item_type: 'subscription_plan', purchase_status: 'completed', subscription_end_date: new Date(Date.now() + 86400000).toISOString() }
      ];
      mockUseAuth.mockReturnValue({ user, session, userPurchases: purchases, isLoading: false, isLoadingPurchases: false });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      await waitFor(() => expect(screen.getByText(testQuiz.title)).toBeInTheDocument());
      expect(screen.getByText('Begin Quiz')).toBeInTheDocument();
    });

    it('should deny access and show link to plans if user is logged in but no access', async () => {
      mockUseAuth.mockReturnValue({ user, session, userPurchases: [], isLoading: false, isLoadingPurchases: false });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      await waitFor(() => expect(screen.getByText('Access Denied')).toBeInTheDocument());
      expect(screen.getByText(/You need to enroll in the course/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View Subscription Plans/i })).toHaveAttribute('href', '/subscription-plans');
    });

    it('should deny access and show link to login if user is not logged in', async () => {
      mockUseAuth.mockReturnValue({ user: null, session: null, userPurchases: null, isLoading: false, isLoadingPurchases: false });
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      await waitFor(() => expect(screen.getByText('Access Denied')).toBeInTheDocument());
      expect(screen.getByText(/Please log in to access this quiz/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Login/i })).toHaveAttribute('href', '/auth');
    });
  });

  describe('Quiz Attempt Saving', () => {
    beforeEach(() => {
      // Grant access for these tests
      const purchases: ActiveUserPurchase[] = [
        { id: 1, item_id: testQuiz.courseId.toString(), item_type: 'course', purchase_status: 'completed', subscription_end_date: null }
      ];
      mockUseAuth.mockReturnValue({ user, session, userPurchases: purchases, isLoading: false, isLoadingPurchases: false });
    });

    it('should call supabase.from("user_quiz_attempts").insert() with correct data on quiz submission', async () => {
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      
      // Start the quiz
      await act(async () => {
        fireEvent.click(screen.getByText('Begin Quiz'));
      });
      
      // Answer questions (simplified - just click next until submit)
      // A more thorough test would simulate answering each question
      for (let i = 0; i < testQuiz.questions.length; i++) {
        // If it's a multiple choice, select the first option before clicking next
        const firstOptionRadio = screen.queryByRole('radio', { checked: false });
        if (firstOptionRadio) {
           fireEvent.click(firstOptionRadio); // Select first option
        }
        // If it's a short answer, type something
        const shortAnswerInput = screen.queryByPlaceholderText('Type your answer here...');
        if (shortAnswerInput) {
            fireEvent.change(shortAnswerInput, { target: { value: 'Test Answer' } });
        }

        const nextButtonText = i === testQuiz.questions.length - 1 ? 'Submit Quiz' : 'Next';
        const nextButton = screen.getByRole('button', { name: new RegExp(nextButtonText, 'i') });
        await act(async () => {
            fireEvent.click(nextButton);
        });
      }

      await waitFor(() => {
        expect(screen.getByText('Quiz Results')).toBeInTheDocument();
      });

      expect(mockSupabaseFrom).toHaveBeenCalledWith('user_quiz_attempts');
      expect(mockInsert).toHaveBeenCalledTimes(1);
      
      const insertedData = mockInsert.mock.calls[0][0];
      expect(insertedData.user_id).toBe(user.id);
      expect(insertedData.quiz_id).toBe(testQuiz.id);
      expect(insertedData.course_id).toBe(testQuiz.courseId);
      expect(insertedData).toHaveProperty('score');
      expect(insertedData).toHaveProperty('total_possible');
      expect(insertedData).toHaveProperty('answers'); // Array of answers
      expect(insertedData).toHaveProperty('attempt_date');
      expect(Array.isArray(insertedData.answers)).toBe(true);
    });

    it('should show error toast if saving attempt fails', async () => {
      const mockToast = jest.fn();
      (useAuth as jest.Mock).mockReturnValue({ // Re-mock to override toast for this specific test
        user, session, 
        userPurchases: [{ id: 1, item_id: testQuiz.courseId.toString(), item_type: 'course', purchase_status: 'completed', subscription_end_date: null }],
        isLoading: false, isLoadingPurchases: false,
        // toast: mockToast, // This isn't how useToast works, it's a separate hook.
      });
      // Need to mock useToast directly if we want to assert on it.
      // The global mock for useToast will catch calls, but if we want to assert on THIS call:
      const localMockToast = jest.fn();
      jest.spyOn(require('@/hooks/use-toast'), 'useToast').mockImplementationOnce(() => ({ toast: localMockToast }));


      mockInsert.mockResolvedValueOnce({ error: { message: 'Database error' } });
      
      renderWithRouter(<QuizPage />, { route: `/quiz/${testQuiz.id}`, path: '/quiz/:id' });
      await act(async () => { fireEvent.click(screen.getByText('Begin Quiz')); });
      
      // Simulate answering and submitting
      const submitButton = screen.getByRole('button', { name: /Submit Quiz/i }); // Assuming last question
       await act(async () => {
           // In a real scenario, answer all questions first
           // For this test, just try to submit if the button is rendered
           if (testQuiz.questions.length === 1) { // Simplified for single question quiz test
             const firstOptionRadio = screen.queryByRole('radio', { checked: false });
             if (firstOptionRadio) fireEvent.click(firstOptionRadio);
           }
           fireEvent.click(submitButton);
       });

      await waitFor(() => {
        expect(localMockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: "Save Error",
          description: expect.stringContaining('Failed to save quiz attempt: Database error'),
          variant: "destructive",
        }));
      });
       jest.restoreAllMocks(); // Restore useToast mock
    });
  });
});
