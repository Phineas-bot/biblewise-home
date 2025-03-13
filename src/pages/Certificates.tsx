
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Share2, Award, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { BookCourse } from "@/types/course";

interface Certificate {
  id: number;
  courseId: number;
  courseTitle: string;
  completionDate: Date;
  imageUrl: string;
}

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completedCourses, setCompletedCourses] = useState<BookCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // This would normally be fetched from Supabase
        // For demo purposes, we're creating sample data
        const sampleCompletedCourses: BookCourse[] = [
          {
            id: 1,
            title: "The Purpose Driven Life",
            author: "Rick Warren",
            cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
            status: "completed",
            progress: 100,
            description: "Discover the answer to life's most fundamental question: What on earth am I here for?",
            category: "Christian Living",
            isNew: false,
            isPopular: true,
            lessons: 12,
          },
          {
            id: 3,
            title: "Knowing God",
            author: "J.I. Packer",
            cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
            status: "completed",
            progress: 100,
            description: "A journey into the Father's heart, written with simplicity and theological depth.",
            category: "Theology",
            isNew: false,
            isPopular: false,
            lessons: 8,
          },
        ];
        
        setCompletedCourses(sampleCompletedCourses);
        
        // Generate certificates for completed courses
        const sampleCertificates: Certificate[] = sampleCompletedCourses.map((course, index) => ({
          id: index + 1,
          courseId: course.id,
          courseTitle: course.title,
          completionDate: new Date(Date.now() - Math.random() * 10000000000),
          imageUrl: `/certificates/certificate-${index + 1}.jpg`, // These would be dynamically generated
        }));
        
        setCertificates(sampleCertificates);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error fetching certificates",
          description: "Failed to load your certificates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleDownload = (certificate: Certificate) => {
    // This would normally generate and download a PDF
    toast({
      title: "Certificate Downloaded",
      description: `${certificate.courseTitle} certificate has been downloaded.`,
    });
  };

  const handleShare = (certificate: Certificate) => {
    const shareText = `I've completed the ${certificate.courseTitle} course and earned a certificate!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Bible Course Certificate',
        text: shareText,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareText + ' ' + window.location.href);
      toast({
        title: "Copied to clipboard",
        description: "Share link copied to clipboard!",
      });
    }
  };

  // Calculate progress towards diploma
  const totalCoursesRequired = 10;
  const currentProgress = completedCourses.length;
  const progressPercentage = Math.min(100, (currentProgress / totalCoursesRequired) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="bg-bible-sand/30 py-10 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-bible-navy mb-3">Your Certificates</h1>
            <p className="text-gray-600 max-w-3xl">
              Congratulations on your achievements! Here are the certificates you've earned by completing our Bible courses.
            </p>
          </div>
        </div>
        
        <section className="container mx-auto px-4 py-12">
          {/* Diploma Progress Tracker */}
          <Card className="mb-10 border-bible-navy/10">
            <CardHeader className="bg-bible-navy/5 border-b pb-4">
              <CardTitle className="flex items-center text-bible-navy">
                <GraduationCap className="mr-2 h-6 w-6" />
                Bible Studies Diploma Progress
              </CardTitle>
              <CardDescription>
                Complete {totalCoursesRequired} courses to earn your Bible Studies Diploma
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {currentProgress} of {totalCoursesRequired} courses completed
                  </span>
                  <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="pt-4 flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    <span>{totalCoursesRequired - currentProgress} more to go</span>
                  </div>
                  {progressPercentage >= 100 ? (
                    <span className="text-green-600 font-medium flex items-center">
                      <Award className="mr-1 h-4 w-4" />
                      Diploma Ready!
                    </span>
                  ) : (
                    <span>Keep learning!</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="py-20 text-center text-gray-500">Loading your certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Certificates Yet</h3>
              <p className="text-gray-500 mb-6">Complete your first course to earn a certificate.</p>
              <Button asChild>
                <a href="/courses">Browse Courses</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                  <div className="relative aspect-[4/3] bg-bible-sand/20 overflow-hidden">
                    {/* Certificate Preview (would be actual certificate images) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center border-4 border-bible-gold/20 m-4 bg-white">
                      <div className="text-bible-navy font-serif tracking-wide">
                        <div className="text-xs uppercase tracking-widest mb-1">Certificate of Completion</div>
                        <div className="text-xl font-bold mb-3">{certificate.courseTitle}</div>
                        <div className="text-sm mb-4">Awarded to</div>
                        <div className="text-lg font-bold mb-4">{user.email?.split('@')[0] || "Student"}</div>
                        <div className="text-xs">
                          Completed on {formatDate(certificate.completionDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg text-bible-navy">{certificate.courseTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Completed on {formatDate(certificate.completionDate)}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between px-6 pb-6 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-bible-navy border-bible-navy/30 hover:bg-bible-navy/5"
                      onClick={() => handleDownload(certificate)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-bible-navy border-bible-navy/30 hover:bg-bible-navy/5"
                      onClick={() => handleShare(certificate)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Achievement Information */}
          <div className="mt-16 bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-bible-navy mb-4">About Our Certifications</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Course Certificates</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Each certificate represents your mastery of a specific Bible study course. 
                  These certificates verify your commitment to deepening your understanding 
                  of Scripture and can be shared with your church community or study groups.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Bible Studies Diploma</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Complete all 10 core courses to earn your comprehensive Bible Studies Diploma,
                  recognizing your dedication to thorough biblical education. This achievement
                  demonstrates your well-rounded knowledge of Scripture and biblical principles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Certificates;
