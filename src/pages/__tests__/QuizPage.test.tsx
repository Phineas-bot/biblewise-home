import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizPage from '../QuizPage';
import { quizzes } from '@/data/quizData'; // Import actual quiz data for testing
import { useToast } from '@/hooks/use-toast';

// Mocks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock Navbar as it's imported and used
jest.mock('@/components/Navbar', () => () => <nav>Navbar Mock</nav>);

const mockQuizData = quizzes[0]; // Use the first quiz for testing
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

const mockToast = jest.fn();

const renderQuizPage = (quizId: string) => {
  (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  (jest.requireMock('react-router-dom').useParams as jest.Mock).mockReturnValue({ id: quizId });
  
  return render(
    // Using MemoryRouter to allow initialEntries for specific routes
    <MemoryRouter initialEntries={[`/quiz/${quizId}`]}>
      <Routes>
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/courses" element={<div>Courses Page</div>} /> {/* Mock target for navigation */}
      </Routes>
    </MemoryRouter>
  );
};

describe('QuizPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for timer tests
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers(); // Restore real timers
  });

  it('loads quiz data and displays QuizIntro', async () => {
    renderQuizPage(String(mockQuizData.id));
    
    // Check for QuizIntro content
    expect(screen.getByText(mockQuizData.title)).toBeInTheDocument();
    expect(screen.getByText(mockQuizData.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockQuizData.questions.length} Questions`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Begin Quiz/i })).toBeInTheDocument();
  });

  it('navigates to /courses if quiz not found', async () => {
    renderQuizPage('invalid-id-999'); // An ID that doesn't exist

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Quiz not found",
        description: "The requested quiz could not be found.",
        variant: "destructive"
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  it('starts the quiz, displays first question, and timer starts', () => {
    renderQuizPage(String(mockQuizData.id));
    
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));

    // Check for first question content
    expect(screen.getByText(mockQuizData.questions[0].question)).toBeInTheDocument();
    expect(screen.getByText(`Question 1 of ${mockQuizData.questions.length}`)).toBeInTheDocument();
    
    // Check timer is visible (initial time formatted)
    const expectedTime = `${mockQuizData.timeLimit.toString().padStart(2, '0')}:00`;
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const timeAfterOneSecond = mockQuizData.timeLimit * 60 - 1;
    const minutes = Math.floor(timeAfterOneSecond / 60).toString().padStart(2, '0');
    const seconds = (timeAfterOneSecond % 60).toString().padStart(2, '0');
    expect(screen.getByText(`${minutes}:${seconds}`)).toBeInTheDocument();
  });

  it('handles answer selection and moves to next question', () => {
    renderQuizPage(String(mockQuizData.id));
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));

    const firstQuestion = mockQuizData.questions[0];
    // Assuming first question is multiple-choice or true-false
    if (firstQuestion.options && firstQuestion.options.length > 0) {
      fireEvent.click(screen.getByLabelText(firstQuestion.options[0]));
    }
    
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    
    // Check for second question content
    expect(screen.getByText(mockQuizData.questions[1].question)).toBeInTheDocument();
    expect(screen.getByText(`Question 2 of ${mockQuizData.questions.length}`)).toBeInTheDocument();
  });
  
  it('navigates between questions using Previous and Next', () => {
    renderQuizPage(String(mockQuizData.id));
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));

    // Go to Q2
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText(mockQuizData.questions[1].question)).toBeInTheDocument();

    // Go back to Q1
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    expect(screen.getByText(mockQuizData.questions[0].question)).toBeInTheDocument();
    // Previous button should be disabled on the first question
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  it('submits the quiz when on the last question and Next is clicked', () => {
    renderQuizPage(String(mockQuizData.id));
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));

    // Navigate to the last question
    mockQuizData.questions.forEach((_, index) => {
      if (index < mockQuizData.questions.length - 1) {
        // Select an answer for current question to enable Next (if validation exists)
        const currentQuestion = mockQuizData.questions[index];
        if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
          if(screen.queryByLabelText(currentQuestion.options![0])) {
            fireEvent.click(screen.getByLabelText(currentQuestion.options![0]));
          }
        } else if (currentQuestion.type === 'short-answer') {
          const input = screen.getByPlaceholderText(/Type your answer here.../i);
          fireEvent.change(input, { target: { value: 'Some answer' } });
        }
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      }
    });
    
    // Now on the last question, the button should say "Submit Quiz"
    expect(screen.getByText(mockQuizData.questions[mockQuizData.questions.length - 1].question)).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /Submit Quiz/i });
    expect(submitButton).toBeInTheDocument();
    
    // Select answer for last question
     const lastQuestion = mockQuizData.questions[mockQuizData.questions.length - 1];
     if (lastQuestion.type === 'multiple-choice' || lastQuestion.type === 'true-false') {
       if(screen.queryByLabelText(lastQuestion.options![0])) {
         fireEvent.click(screen.getByLabelText(lastQuestion.options![0]));
       }
     } else if (lastQuestion.type === 'short-answer') {
       const input = screen.getByPlaceholderText(/Type your answer here.../i);
       fireEvent.change(input, { target: { value: 'Some answer' } });
     }

    fireEvent.click(submitButton);

    // Check for QuizResults content (e.g., "Quiz Results" title)
    expect(screen.getByText('Quiz Results')).toBeInTheDocument();
    // Score calculation depends on answers, this just checks submission leads to results view.
  });

  it('auto-submits the quiz when timer runs out', () => {
    renderQuizPage(String(mockQuizData.id));
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));

    // Fast-forward time to end the quiz
    act(() => {
      jest.advanceTimersByTime(mockQuizData.timeLimit * 60 * 1000);
    });

    // Check for QuizResults content
    expect(screen.getByText('Quiz Results')).toBeInTheDocument();
  });
  
  it('allows retaking the quiz from results page', () => {
    renderQuizPage(String(mockQuizData.id));
    fireEvent.click(screen.getByRole('button', { name: /Begin Quiz/i }));
    
    // Submit quiz immediately (e.g., by advancing timer)
    act(() => {
      jest.advanceTimersByTime(mockQuizData.timeLimit * 60 * 1000);
    });
    expect(screen.getByText('Quiz Results')).toBeInTheDocument();

    // Click retake quiz (assuming the user failed or the button is always there)
    // The button might only appear if the user fails. Let's assume it's there for testing.
    // If the mock quiz has a high passing score, this test might need specific answers.
    // For simplicity, we'll assume the retake button is always present.
    // If not, need to simulate a failing score.
    // The QuizResults component shows "Retake Quiz" if !isPassing.
    // We'll need to ensure the mock quiz attempt results in a non-passing score or mock isPassing.
    // For now, assuming the button is available.
    const retakeButton = screen.getByRole('button', { name: /Retake Quiz/i });
    fireEvent.click(retakeButton);

    // Should be back to the first question
    expect(screen.getByText(mockQuizData.questions[0].question)).toBeInTheDocument();
    const expectedTime = `${mockQuizData.timeLimit.toString().padStart(2, '0')}:00`;
    expect(screen.getByText(expectedTime)).toBeInTheDocument(); // Timer reset
  });

});
