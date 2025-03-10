
import React from 'react';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, RefreshCw, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetake: () => void;
}

const QuizResults = ({ quiz, attempt, onRetake }: QuizResultsProps) => {
  const navigate = useNavigate();
  const isPassing = attempt.score >= quiz.passingScore;
  const duration = Math.round((attempt.endTime.getTime() - attempt.startTime.getTime()) / 1000 / 60);
  
  const handleShareResults = () => {
    navigator.clipboard.writeText(`I scored ${attempt.score}% on ${quiz.title}!`);
    toast({
      title: "Results copied to clipboard",
      description: "Your quiz results have been copied. Share with friends!",
    });
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-8 overflow-hidden">
        <div className={`p-4 text-white ${isPassing ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-orange-600 to-orange-500'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">Completed in {duration} minutes</span>
            </div>
          </div>
        </div>
        
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">{isPassing ? 'Congratulations!' : 'Almost There!'}</CardTitle>
          <CardDescription className="text-lg">
            {isPassing
              ? "You've successfully passed the quiz!"
              : "You didn't reach the passing score, but you can try again!"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{attempt.score}%</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={isPassing ? "#4ade80" : "#f97316"}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * attempt.score / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            
            <div className="text-center">
              <p className="font-medium">Passing score: {quiz.passingScore}%</p>
              <p className="text-sm text-muted-foreground">{attempt.answers.filter(a => a.isCorrect).length} of {quiz.questions.length} questions correct</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-medium mb-4">Question Breakdown</h3>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              
              return (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{index + 1}. {question.question}</p>
                      
                      {userAnswer && (
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Your answer: </span>
                            {Array.isArray(userAnswer.userAnswer) 
                              ? userAnswer.userAnswer.join(", ")
                              : userAnswer.userAnswer}
                          </p>
                          
                          {!isCorrect && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Correct answer: </span>
                              {Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer[0]
                                : question.correctAnswer}
                            </p>
                          )}
                          
                          {!isCorrect && (
                            <p className="text-sm mt-2 text-muted-foreground">{question.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            {!isPassing && (
              <Button onClick={onRetake} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate(`/courses`)}
              className="flex-1"
            >
              Back to Courses
            </Button>
            
            <Button 
              variant="secondary"
              onClick={handleShareResults}
              className="flex-1"
            >
              <Award className="mr-2 h-4 w-4" /> Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
