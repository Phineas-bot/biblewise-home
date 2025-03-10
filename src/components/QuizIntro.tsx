
import React from 'react';
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizIntroProps {
  quiz: Quiz;
  onStart: () => void;
}

const QuizIntro = ({ quiz, onStart }: QuizIntroProps) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl text-bible-navy">{quiz.title}</CardTitle>
          <CardDescription className="text-lg">{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <ClipboardList className="h-8 w-8 mb-2 text-bible-navy" />
              <p className="font-medium">{quiz.questions.length} Questions</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mb-2 text-bible-navy" />
              <p className="font-medium">{quiz.timeLimit} Minutes</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Award className="h-8 w-8 mb-2 text-bible-navy" />
              <p className="font-medium">Pass: {quiz.passingScore}%</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiz Instructions:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will have {quiz.timeLimit} minutes to complete the quiz.</li>
              <li>The quiz consists of multiple-choice, true/false, and short-answer questions.</li>
              <li>You can navigate between questions using the previous and next buttons.</li>
              <li>You can change your answers before submission.</li>
              <li>Your score will be displayed immediately after submission.</li>
              <li>A passing score is {quiz.passingScore}% or higher.</li>
            </ul>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={onStart}
              size="lg" 
              className="px-8 py-6 text-lg transition-all hover:scale-105"
            >
              Begin Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizIntro;
