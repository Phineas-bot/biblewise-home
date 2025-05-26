
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button'; // For access denied button
import QuizIntro from '@/components/QuizIntro';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResults from '@/components/QuizResults';
import { quizzes } from '@/data/quizData';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

const QuizPage = () => {
  const { id: quizIdFromParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userPurchases, isLoading: isLoadingAuth, isLoadingPurchases, session } = useAuth();
  const { toast } = useToast(); // Initialize toast

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [answers, setAnswers] = useState<QuizAttempt['answers']>([]);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const [canAccessQuiz, setCanAccessQuiz] = useState(false);

  // Memoize quiz data fetching
  const currentQuizId = useMemo(() => parseInt(quizIdFromParams || '0', 10), [quizIdFromParams]);

  useEffect(() => {
    const quizData = quizzes.find(q => q.id === currentQuizId);
    if (quizData) {
      setQuiz(quizData);
      setTimeRemaining(quizData.timeLimit * 60);
    } else {
      if (currentQuizId) { // Only toast if an ID was actually provided
        toast({
          title: "Quiz not found",
          description: `The quiz with ID ${currentQuizId} could not be found.`,
          variant: "destructive"
        });
      }
      navigate('/courses');
    }
  }, [currentQuizId, navigate, toast]);

  // Access Control Logic
  useEffect(() => {
    if (isLoadingAuth || isLoadingPurchases || !quiz) {
      // Still loading auth data or quiz data, wait before checking access
      setHasCheckedAccess(false);
      return;
    }

    if (!user) { // Not logged in
      setCanAccessQuiz(false);
      setHasCheckedAccess(true);
      return;
    }

    // User is logged in, check purchases
    let accessGranted = false;
    if (userPurchases && quiz.courseId) {
      const hasCoursePurchase = userPurchases.some(
        p => p.item_type === 'course' && p.item_id === quiz.courseId.toString()
      );
      const hasActiveSubscription = userPurchases.some(
        p => p.item_type === 'subscription_plan'
        // Active status (subscription_end_date) is already filtered in AuthContext
      );
      accessGranted = hasCoursePurchase || hasActiveSubscription;
    }
    setCanAccessQuiz(accessGranted);
    setHasCheckedAccess(true);

  }, [user, userPurchases, isLoadingAuth, isLoadingPurchases, quiz, session]);

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
    if (!quiz || !user) { // Ensure user is available for saving attempt
      toast({
        title: "Error Submitting Quiz",
        description: "User not authenticated or quiz data missing.",
        variant: "destructive",
      });
      return;
    }
    
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => {
      const question = quiz.questions.find(q => q.id === a.questionId);
      return sum + (a.isCorrect && question ? question.points : 0);
    }, 0);
    
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    const localAttempt: QuizAttempt = { // This is the local state representation
      id: Date.now(), // Temporary client-side ID
      quizId: quiz.id,
      score,
      totalPossible: totalPoints,
      startTime: new Date(Date.now() - (quiz.timeLimit * 60 - timeRemaining) * 1000),
      endTime: new Date(),
      answers
    };
    
    setQuizAttempt(localAttempt); // Update local state for immediate display
    setIsCompleted(true);

    // Persist to Supabase
    const persistAttempt = async () => {
      if (!user) { // Should be caught by the initial check, but good for safety
        console.error("User not available for persisting attempt.");
        return;
      }
      try {
        const { error: dbError } = await supabase
          .from('user_quiz_attempts')
          .insert({
            user_id: user.id,
            quiz_id: quiz.id,
            course_id: quiz.courseId, // Assuming courseId is part of Quiz type
            score: localAttempt.score,
            total_possible: localAttempt.totalPossible,
            answers: localAttempt.answers as any, // Cast to 'any' if type mismatch with Json
            attempt_date: localAttempt.endTime.toISOString(),
            // created_at and updated_at will be set by DB defaults
          });

        if (dbError) {
          throw dbError;
        }
        toast({
          title: "Quiz Attempt Saved",
          description: "Your quiz results have been saved.",
        });
      } catch (error: any) {
        console.error("Error saving quiz attempt:", error);
        toast({
          title: "Save Error",
          description: `Failed to save quiz attempt: ${error.message}`,
          variant: "destructive",
        });
      }
    };
    persistAttempt();
  };

  const retakeQuiz = () => {
    setIsStarted(true);
    setIsCompleted(false);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(quiz?.timeLimit ? quiz.timeLimit * 60 : 0);
  };

  if (isLoadingAuth || isLoadingPurchases || !hasCheckedAccess || !quiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-bible-blue mb-4" />
          <p className="text-xl text-gray-700">Loading quiz and checking access...</p>
        </main>
      </div>
    );
  }

  if (!canAccessQuiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          {user ? (
            <>
              <p className="text-gray-600 mb-6">
                You need to enroll in the course '{quiz.title}' to take this quiz.
              </p>
              <Button asChild>
                <Link to={`/subscription-plans`}>View Subscription Plans</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Please log in to access this quiz.
              </p>
              <Button asChild>
                <Link to="/auth">Login</Link>
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }
  
  // If access is granted, render the quiz
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        {!isStarted && !isCompleted && quiz && (
          <QuizIntro quiz={quiz} onStart={startQuiz} />
        )}
        
        {isStarted && !isCompleted && quiz && (
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
