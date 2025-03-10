
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import QuizIntro from '@/components/QuizIntro';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResults from '@/components/QuizResults';
import { quizzes } from '@/data/quizData';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<QuizAttempt['answers']>([]);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);

  // Fetch quiz data
  useEffect(() => {
    const quizId = parseInt(id || '0', 10);
    const quizData = quizzes.find(q => q.id === quizId);
    
    if (quizData) {
      setQuiz(quizData);
      setTimeRemaining(quizData.timeLimit * 60); // Convert to seconds
    } else {
      toast({
        title: "Quiz not found",
        description: "The requested quiz could not be found.",
        variant: "destructive"
      });
      navigate('/courses');
    }
  }, [id, navigate]);

  // Timer countdown when quiz is started
  useEffect(() => {
    let timer: number | null = null;
    
    if (isStarted && !isCompleted && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer as number);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStarted, isCompleted, timeRemaining]);

  const startQuiz = () => {
    setIsStarted(true);
    setAnswers([]);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (questionId: number, answer: string | string[], isCorrect: boolean) => {
    setAnswers(prev => [
      ...prev.filter(a => a.questionId !== questionId),
      { questionId, userAnswer: answer, isCorrect }
    ]);
  };

  const moveToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;
    
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => {
      const question = quiz.questions.find(q => q.id === a.questionId);
      return sum + (a.isCorrect && question ? question.points : 0);
    }, 0);
    
    const score = Math.round((earnedPoints / totalPoints) * 100);
    
    const attempt: QuizAttempt = {
      id: Date.now(),
      quizId: quiz.id,
      score,
      totalPossible: totalPoints,
      startTime: new Date(Date.now() - (quiz.timeLimit * 60 - timeRemaining) * 1000),
      endTime: new Date(),
      answers
    };
    
    setQuizAttempt(attempt);
    setIsCompleted(true);
  };

  const retakeQuiz = () => {
    setIsStarted(true);
    setIsCompleted(false);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(quiz?.timeLimit ? quiz.timeLimit * 60 : 0);
  };

  if (!quiz) {
    return <div className="flex justify-center items-center min-h-screen">Loading quiz...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        {!isStarted && !isCompleted && (
          <QuizIntro quiz={quiz} onStart={startQuiz} />
        )}
        
        {isStarted && !isCompleted && (
          <QuizQuestion 
            question={quiz.questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            timeRemaining={timeRemaining}
            onAnswer={handleAnswer}
            onNext={moveToNextQuestion}
            onPrevious={moveToPreviousQuestion}
            userAnswer={answers.find(a => a.questionId === quiz.questions[currentQuestionIndex].id)?.userAnswer}
            isLast={currentQuestionIndex === quiz.questions.length - 1}
          />
        )}
        
        {isCompleted && quizAttempt && (
          <QuizResults 
            quiz={quiz}
            attempt={quizAttempt}
            onRetake={retakeQuiz}
          />
        )}
      </main>
    </div>
  );
};

export default QuizPage;
