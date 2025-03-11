
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Clock, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const currentCourse = {
  id: 3,
  title: "The Way of Sanctification",
  image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  progress: 65,
  currentChapter: "Living in Holiness",
  duration: "Chapter 4 of 7",
  timeRemaining: "10 min remaining",
  nextMilestone: "Complete Chapter 4 Quiz"
};

const ContinueLearning = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-8 text-center">Continue Your Journey</h2>
        
        <Card className="overflow-hidden border-bible-navy/10 max-w-4xl mx-auto">
          <div className="bg-bible-navy text-white py-3 px-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-bible-gold" />
              <span className="font-medium">Your Current Progress</span>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 relative">
                <img 
                  src={currentCourse.image} 
                  alt={currentCourse.title} 
                  className="w-full h-full object-cover min-h-[200px] md:min-h-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent md:hidden"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:hidden">
                  <h3 className="font-semibold text-lg">{currentCourse.title}</h3>
                  <p className="text-sm text-white/80">Book 3 of The Christian Way Series</p>
                </div>
              </div>
              
              <div className="md:w-3/5 p-6">
                <div className="hidden md:block">
                  <span className="text-sm text-gray-500 font-medium">Currently Reading</span>
                  <h3 className="font-semibold text-xl text-bible-navy mb-2">{currentCourse.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Book 3 of The Christian Way Series</p>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                  <BookOpen className="h-4 w-4 text-bible-blue" />
                  <span>{currentCourse.currentChapter}</span>
                  <span className="text-gray-400 ml-1">({currentCourse.duration})</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 text-bible-blue" />
                  <span>{currentCourse.timeRemaining}</span>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-bible-blue">{currentCourse.progress}%</span>
                  </div>
                  <Progress value={currentCourse.progress} className="h-2 bg-bible-sand/30" />
                </div>
                
                <div className="mb-5 py-3 px-4 bg-bible-gold/10 border-l-4 border-bible-gold rounded">
                  <h4 className="font-medium text-sm text-bible-navy mb-1">Next Milestone</h4>
                  <p className="text-sm text-gray-600">{currentCourse.nextMilestone}</p>
                </div>
                
                <div className="flex gap-3">
                  <Button className="bg-bible-blue hover:bg-bible-navy flex-1">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Reading
                  </Button>
                  <Button variant="outline" className="border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white">
                    View All Chapters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContinueLearning;
