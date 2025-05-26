import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // For Link components if any, or useNavigate
import QuizResults from '../QuizResults'; // Adjust path as needed
import { Quiz, QuizAttempt, QuizQuestion as QuestionType } from '@/types/quiz'; // Assuming types
import { useToast } from '@/hooks/use-toast';

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockToastFn = jest.fn();

const mockQuiz: Quiz = {
  id: 1,
  title: 'Test Quiz Title',
  description: 'A quiz to test your knowledge.',
  courseId: 101,
  passingScore: 70,
  timeLimit: 10, // minutes
  questions: [
    { id: 1, type: 'multiple-choice', question: 'Q1', options: ['A', 'B'], correctAnswer: 'A', points: 10, explanation: 'Exp1' },
    { id: 2, type: 'true-false', question: 'Q2', options: ['True', 'False'], correctAnswer: 'True', points: 10, explanation: 'Exp2' },
    { id: 3, type: 'short-answer', question: 'Q3', correctAnswer: ['Answer'], points: 10, explanation: 'Exp3' },
  ],
};

const mockPassingAttempt: QuizAttempt = {
  id: 123,
  quizId: mockQuiz.id,
  score: 80,
  totalPossible: 30, // Assuming all 3 questions answered correctly for simplicity in totalPossible
  startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  endTime: new Date(),
  answers: [
    { questionId: 1, userAnswer: 'A', isCorrect: true },
    { questionId: 2, userAnswer: 'True', isCorrect: true },
    { questionId: 3, userAnswer: 'Answer', isCorrect: true }, // Only 2 correct for 80% if total points is e.g. 25
                                                            // Let's adjust score or answers for consistency.
                                                            // If score is 80, and total Qs = 3, assume 2/3 right.
                                                            // Let total points be 30. 80% of 30 is 24. So 2 questions right, one wrong.
                                                            // Let's make Q3 wrong for this passing attempt for more realism.
                                                            // So, score should be (10+10)/30 * 100 = 66.66.
                                                            // To make it 80, let points be 10,10,5. Total 25. Score 20/25 = 80%.
                                                            // Let's adjust points in mockQuiz.
                                                            // Q1:10, Q2:10, Q3:5. Total 25.
                                                            // For passing (80%): 20 points. Q1, Q2 correct.
  ],
};
// Re-calculate mockPassingAttempt based on updated thoughts
const quizForPassing: Quiz = { ...mockQuiz, questions: [
    { id: 1, type: 'multiple-choice', question: 'Q1: What is A?', options: ['A', 'B'], correctAnswer: 'A', points: 10, explanation: 'Exp1 for A' },
    { id: 2, type: 'true-false', question: 'Q2: Is it True?', options: ['True', 'False'], correctAnswer: 'True', points: 10, explanation: 'Exp2 for True' },
    { id: 3, type: 'short-answer', question: 'Q3: Short one?', correctAnswer: ['Short'], points: 5, explanation: 'Exp3 for Short' },
]};
mockPassingAttempt.answers = [
    { questionId: 1, userAnswer: 'A', isCorrect: true },
    { questionId: 2, userAnswer: 'True', isCorrect: true },
    { questionId: 3, userAnswer: 'Wrong', isCorrect: false }, // Q3 wrong
];
mockPassingAttempt.score = Math.round(((10 + 10) / 25) * 100); // 20/25 = 80%

const mockFailingAttempt: QuizAttempt = {
  ...mockPassingAttempt,
  score: 40, // 10/25
  answers: [
    { questionId: 1, userAnswer: 'A', isCorrect: true },
    { questionId: 2, userAnswer: 'False', isCorrect: false },
    { questionId: 3, userAnswer: 'Wrong', isCorrect: false },
  ],
};


const mockOnRetake = jest.fn();

describe('QuizResults.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToastFn });
  });

  it('renders passing state correctly', () => {
    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockPassingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );

    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText("You've successfully passed the quiz!")).toBeInTheDocument();
    expect(screen.getByText(`${mockPassingAttempt.score}%`)).toBeInTheDocument();
    expect(screen.getByText(/2 of 3 questions correct/i)).toBeInTheDocument(); // Based on 2 correct answers
    expect(screen.queryByRole('button', { name: /Retake Quiz/i })).not.toBeInTheDocument(); // Should not show for passing
  });

  it('renders failing state correctly and shows Retake Quiz button', () => {
    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockFailingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );

    expect(screen.getByText('Almost There!')).toBeInTheDocument();
    expect(screen.getByText("You didn't reach the passing score, but you can try again!")).toBeInTheDocument();
    expect(screen.getByText(`${mockFailingAttempt.score}%`)).toBeInTheDocument();
    expect(screen.getByText(/1 of 3 questions correct/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retake Quiz/i })).toBeInTheDocument();
  });

  it('displays question breakdown correctly', () => {
    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockFailingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );

    // Check Q1 (Correct)
    expect(screen.getByText(`1. ${quizForPassing.questions[0].question}`)).toBeInTheDocument();
    expect(screen.getByText(`Your answer: ${mockFailingAttempt.answers[0].userAnswer}`)).toBeInTheDocument();
    // Correct answer and explanation should not be shown for correct items unless logic changes (it did in prev subtask)
    // The previous subtask made explanations always visible if they exist.
    expect(screen.getByText(quizForPassing.questions[0].explanation!)).toBeInTheDocument();


    // Check Q2 (Incorrect)
    expect(screen.getByText(`2. ${quizForPassing.questions[1].question}`)).toBeInTheDocument();
    expect(screen.getByText(`Your answer: ${mockFailingAttempt.answers[1].userAnswer}`)).toBeInTheDocument();
    expect(screen.getByText(`Correct answer: ${quizForPassing.questions[1].correctAnswer}`)).toBeInTheDocument();
    expect(screen.getByText(quizForPassing.questions[1].explanation!)).toBeInTheDocument();
    
    // Check Q3 (Incorrect, short-answer)
    expect(screen.getByText(`3. ${quizForPassing.questions[2].question}`)).toBeInTheDocument();
    expect(screen.getByText(`Your answer: ${mockFailingAttempt.answers[2].userAnswer}`)).toBeInTheDocument();
    // For short answer, it shows the first correct answer. If array, joins with " or "
    const expectedCorrectQ3 = Array.isArray(quizForPassing.questions[2].correctAnswer) 
        ? (quizForPassing.questions[2].correctAnswer as string[]).join(" or ") 
        : quizForPassing.questions[2].correctAnswer;
    expect(screen.getByText(`Correct answer: ${expectedCorrectQ3}`)).toBeInTheDocument();
    expect(screen.getByText(quizForPassing.questions[2].explanation!)).toBeInTheDocument();
  });

  it('calls onRetake when Retake Quiz button is clicked', () => {
    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockFailingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Retake Quiz/i }));
    expect(mockOnRetake).toHaveBeenCalledTimes(1);
  });

  it('navigates to /courses when "Back to Courses" is clicked', () => {
    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockPassingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Back to Courses/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  it('copies results to clipboard and shows toast on "Share Results"', async () => {
    // Mock navigator.clipboard.writeText
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <BrowserRouter>
        <QuizResults quiz={quizForPassing} attempt={mockPassingAttempt} onRetake={mockOnRetake} />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Share Results/i }));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `I scored ${mockPassingAttempt.score}% on ${quizForPassing.title}!`
    );
    await waitFor(() => {
        expect(mockToastFn).toHaveBeenCalledWith({
            title: "Results copied to clipboard",
            description: "Your quiz results have been copied. Share with friends!",
        });
    });
  });
});
