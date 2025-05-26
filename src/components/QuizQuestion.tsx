
import React, { useState, useEffect } from 'react';
import { QuizQuestion as QuestionType } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface QuizQuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswer: (questionId: number, answer: string | string[], isCorrect: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  userAnswer?: string | string[];
  isLast: boolean;
}

const QuizQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  onNext,
  onPrevious,
  userAnswer,
  isLast,
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [shortAnswer, setShortAnswer] = useState<string>('');
  const [error, setError] = useState('');
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Set initial state based on user's previous answer
  useEffect(() => {
    if (userAnswer) {
      if (typeof userAnswer === 'string') {
        if (question.type === 'short-answer') {
          setShortAnswer(userAnswer);
        } else {
          setSelectedAnswer(userAnswer);
        }
      }
    } else {
      setSelectedAnswer('');
      setShortAnswer('');
    }
  }, [question.id, userAnswer, question.type]);
  
  // Check if answer is correct
  const checkAnswer = (answer: string | string[]): boolean => {
    if (question.type === 'short-answer' && Array.isArray(question.correctAnswer)) {
      const normalizedAnswer = (answer as string).trim().toLowerCase();
      return question.correctAnswer.some(a => 
        a.toLowerCase() === normalizedAnswer
      );
    } else if (typeof question.correctAnswer === 'string') {
      return question.correctAnswer === answer;
    }
    return false;
  };
  
  // Handle answer selection for multiple choice and true/false
  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(value);
    setError('');
    onAnswer(question.id, value, checkAnswer(value));
  };
  
  // Handle short answer input
  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setShortAnswer(newValue);
    setError('');
    // Call onAnswer immediately to save the intermediate input
    // The final correctness for scoring will be based on the state at the time of submission,
    // but this ensures the typed value is saved if navigating back and forth.
    if (question.type === 'short-answer') {
      onAnswer(question.id, newValue, checkAnswer(newValue));
    }
  };
  
  // Handle short answer submission
  const handleShortAnswerSubmit = () => {
    if (!shortAnswer.trim()) {
      setError('Please enter an answer');
      return;
    }
    onAnswer(question.id, shortAnswer, checkAnswer(shortAnswer));
    onNext();
  };
  
  // Handle submit button click
  const handleSubmit = () => {
    if (question.type === 'short-answer') {
      if (!shortAnswer.trim()) {
        setError('Please enter an answer');
        return;
      }
      onAnswer(question.id, shortAnswer, checkAnswer(shortAnswer));
    } else if (!selectedAnswer) {
      setError('Please select an answer');
      return;
    }
    
    onNext();
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center page-fade-in" style={{animationDelay: "0.1s"}}>
        <div className="text-sm font-medium">
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-bible-navy" />
          <span className={`font-mono ${timeRemaining < 60 ? 'text-red-600 font-bold' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      <Progress 
        value={(questionNumber / totalQuestions) * 100} 
        className="h-2 mb-6 page-fade-in"
        style={{animationDelay: "0.2s"}}
      />
      
      <Card key={question.id} className="page-fade-in" style={{animationDelay: "0.3s"}}> {/* Added key and page-fade-in */}
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          {(question.type === 'multiple-choice' || question.type === 'true-false') && (
            <RadioGroup
              value={selectedAnswer}
              onValueChange={handleSelectAnswer}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {question.type === 'short-answer' && (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer here..."
                value={shortAnswer}
                onChange={handleShortAnswerChange}
                className="w-full p-3"
              />
            </div>
          )}
          
          {error && <p className="text-destructive mt-2">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={questionNumber === 1}
            className="button-press"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button onClick={handleSubmit} className="button-press">
            {isLast ? 'Submit Quiz' : 'Next'}
            {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizQuestion;
