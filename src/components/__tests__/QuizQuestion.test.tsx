import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizQuestion from '../QuizQuestion'; // Adjust path as needed
import { QuizQuestion as QuestionType } from '@/types/quiz'; // Assuming types are here

const mockOnAnswer = jest.fn();
const mockOnNext = jest.fn();
const mockOnPrevious = jest.fn();

const multipleChoiceQuestion: QuestionType = {
  id: 1,
  type: 'multiple-choice',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5'],
  correctAnswer: '4',
  points: 10,
  explanation: '2 + 2 equals 4.',
};

const trueFalseQuestion: QuestionType = {
  id: 2,
  type: 'true-false',
  question: 'Is the sky blue?',
  options: ['True', 'False'],
  correctAnswer: 'True',
  points: 5,
  explanation: 'The sky is typically blue due to Rayleigh scattering.',
};

const shortAnswerQuestion: QuestionType = {
  id: 3,
  type: 'short-answer',
  question: 'What is the capital of France?',
  correctAnswer: ['Paris', 'paris'], // Accept different casings
  points: 10,
  explanation: 'Paris is the capital of France.',
};

const defaultProps = {
  questionNumber: 1,
  totalQuestions: 3,
  timeRemaining: 300, // 5 minutes
  onAnswer: mockOnAnswer,
  onNext: mockOnNext,
  onPrevious: mockOnPrevious,
  userAnswer: undefined,
  isLast: false,
};

describe('QuizQuestion.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multiple Choice Question', () => {
    it('renders correctly and handles answer selection', () => {
      render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} />);

      expect(screen.getByText(multipleChoiceQuestion.question)).toBeInTheDocument();
      multipleChoiceQuestion.options?.forEach(option => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
      });

      // Select an answer
      fireEvent.click(screen.getByLabelText(multipleChoiceQuestion.options![1])); // Select '4'
      expect(mockOnAnswer).toHaveBeenCalledWith(multipleChoiceQuestion.id, '4', true); // true because '4' is correct
      
      // Click Next
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('shows error if no answer selected and Next is clicked', () => {
      render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} />);
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      expect(screen.getByText('Please select an answer')).toBeInTheDocument();
      expect(mockOnAnswer).not.toHaveBeenCalled(); // onAnswer should not be called
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('True/False Question', () => {
    it('renders correctly and handles answer selection', () => {
      render(<QuizQuestion {...defaultProps} question={trueFalseQuestion} />);

      expect(screen.getByText(trueFalseQuestion.question)).toBeInTheDocument();
      trueFalseQuestion.options?.forEach(option => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
      });

      // Select an answer
      fireEvent.click(screen.getByLabelText(trueFalseQuestion.options![0])); // Select 'True'
      expect(mockOnAnswer).toHaveBeenCalledWith(trueFalseQuestion.id, 'True', true);
    });
  });

  describe('Short Answer Question', () => {
    it('renders correctly and handles input', () => {
      render(<QuizQuestion {...defaultProps} question={shortAnswerQuestion} />);

      expect(screen.getByText(shortAnswerQuestion.question)).toBeInTheDocument();
      const inputElement = screen.getByPlaceholderText('Type your answer here...');
      expect(inputElement).toBeInTheDocument();

      // Type an answer
      fireEvent.change(inputElement, { target: { value: 'Paris' } });
      // Check if onAnswer is called on change (as per recent bug fix for short answers)
      expect(mockOnAnswer).toHaveBeenCalledWith(shortAnswerQuestion.id, 'Paris', true);

      // Click Next (which also submits the short answer)
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      // onAnswer would have been called again by handleSubmit if not for the onChange call.
      // The current implementation calls onAnswer in handleShortAnswerChange AND in handleSubmit.
      // This might be slightly redundant but ensures the answer is captured.
      // Let's verify it was called at least once with the final correct value by handleSubmit path.
      // The test for `handleShortAnswerChange` calling `onAnswer` is implicitly covered by the above.
      // The `handleSubmit` will call `onAnswer` again.
      expect(mockOnAnswer).toHaveBeenLastCalledWith(shortAnswerQuestion.id, 'Paris', true); 
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('shows error if no answer typed and Next is clicked', () => {
      render(<QuizQuestion {...defaultProps} question={shortAnswerQuestion} />);
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      expect(screen.getByText('Please enter an answer')).toBeInTheDocument();
      expect(mockOnAnswer).not.toHaveBeenCalled(); // onAnswer should not be called by handleSubmit if input is empty
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('correctly identifies various correct short answers (case-insensitive)', () => {
      render(<QuizQuestion {...defaultProps} question={shortAnswerQuestion} />);
      const inputElement = screen.getByPlaceholderText('Type your answer here...');

      fireEvent.change(inputElement, { target: { value: 'paris ' } }); // With space, lowercase
      expect(mockOnAnswer).toHaveBeenCalledWith(shortAnswerQuestion.id, 'paris ', true);
      
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      expect(mockOnAnswer).toHaveBeenLastCalledWith(shortAnswerQuestion.id, 'paris ', true);
    });
  });

  it('displays "Submit Quiz" for the last question', () => {
    render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} isLast={true} />);
    expect(screen.getByRole('button', { name: /Submit Quiz/i })).toBeInTheDocument();
  });

  it('Previous button is disabled on the first question', () => {
    render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} questionNumber={1} />);
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  it('Previous button is enabled on subsequent questions and calls onPrevious', () => {
    render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} questionNumber={2} />);
    const prevButton = screen.getByRole('button', { name: /Previous/i });
    expect(prevButton).not.toBeDisabled();
    fireEvent.click(prevButton);
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });
  
  it('restores user answer on mount for multiple choice', () => {
    render(
      <QuizQuestion 
        {...defaultProps} 
        question={multipleChoiceQuestion} 
        userAnswer="4" // Pre-existing answer
      />
    );
    // Check if '4' is selected. RadioGroupItem value prop is used.
    // This is tricky to directly test the "checked" state of a custom RadioGroupItem without more detailed selectors.
    // However, if `onAnswer` was called with the correct value when it was initially set, that implies restoration.
    // The `useEffect` sets `selectedAnswer` which is the value for `RadioGroup`.
    // We can infer by ensuring no new `onAnswer` call happens on render with a pre-selected answer.
    expect(mockOnAnswer).not.toHaveBeenCalled(); 
    // And that the component renders with the value selected
    expect(screen.getByLabelText('4')).toBeChecked();
  });

  it('restores user answer on mount for short answer', () => {
    render(
      <QuizQuestion 
        {...defaultProps} 
        question={shortAnswerQuestion} 
        userAnswer="Old Answer" 
      />
    );
    expect(screen.getByPlaceholderText('Type your answer here...')).toHaveValue('Old Answer');
    expect(mockOnAnswer).not.toHaveBeenCalled(); // No new answer submission on render
  });
  
  it('displays time remaining and formats it correctly', () => {
    render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} timeRemaining={125} />); // 2 minutes 5 seconds
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('shows time in red if less than 60 seconds', () => {
    render(<QuizQuestion {...defaultProps} question={multipleChoiceQuestion} timeRemaining={59} />);
    const timeElement = screen.getByText('00:59');
    expect(timeElement).toHaveClass('text-red-600');
  });
});
