
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookCourseInfo, 
  BookChapterFE, 
  BookSectionFE, 
  BookProgress, 
  DbCourse, 
  DbChapter, 
  DbSection 
} from '@/types/course'; // Updated types
import { Button } from '@/components/ui/button';
import { Progress as ShadProgress } from '@/components/ui/progress'; // Renamed to avoid conflict
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import TableOfContents from '@/components/TableOfContents';
import ReadingPane from '@/components/ReadingPane';
import ReadingControls from '@/components/ReadingControls';
import { Sun, Moon, ArrowLeft, Bookmark, Loader2 } from 'lucide-react'; // Added Loader2
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Added useAuth
import { supabase } from '@/integrations/supabase/client'; // Added Supabase client


const BookReader = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth(); // Get user from useAuth

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100);
  
  const [courseInfo, setCourseInfo] = useState<BookCourseInfo | null>(null);
  const [chaptersFE, setChaptersFE] = useState<BookChapterFE[]>([]);
  const [bookProgressFE, setBookProgressFE] = useState<BookProgress>({
    currentChapterId: null,
    currentSectionId: null,
    completedSectionIds: new Set(),
    totalPages: 0,
    bookmarks: [],
    highlights: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data and check access
  useEffect(() => {
    if (authLoading) return; // Wait for user auth status to be determined

    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to access courses.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    if (!courseIdParam) {
      setError("Course ID is missing.");
      setIsLoading(false);
      return;
    }
    const currentCourseId = parseInt(courseIdParam);
    if (isNaN(currentCourseId)) {
        setError("Invalid Course ID format.");
        setIsLoading(false);
        navigate('/courses');
        return;
    }


    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch Course Details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', currentCourseId)
          .single();

        if (courseError || !courseData) {
          throw new Error(courseError?.message || "Course not found.");
        }
        
        const dbCourse = courseData as DbCourse;
        setCourseInfo({
            id: dbCourse.id,
            title: dbCourse.title,
            author: dbCourse.author,
            cover_image_url: dbCourse.cover_image_url,
            description: dbCourse.description,
        });


        // 2. Access Control Check
        let hasAccess = false;
        // Check for single purchase
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', currentCourseId)
          .eq('status', 'succeeded') // Assuming 'succeeded' is the status for completed purchases
          .maybeSingle();

        if (purchaseError) console.warn("Error checking purchases:", purchaseError.message);
        if (purchaseData) hasAccess = true;

        // Check for active subscription (if not already accessed by single purchase)
        if (!hasAccess) {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('status, product_id, products(part_of_subscription_plan_id)') // Assuming products table has part_of_subscription_plan_id
                                                                    // and subscriptions has product_id linking to it.
                                                                    // Or, if subscription gives general access, check plan directly.
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing']) // Active or trialing subscriptions
            // .eq('products.part_of_subscription_plan_id', courseData.part_of_subscription_plan_id) // More specific check
            .limit(1); // We only need one active subscription that grants access
          
          if (subscriptionError) console.warn("Error checking subscriptions:", subscriptionError.message);

          if (subscriptionData && subscriptionData.length > 0) {
            // Further check if this subscription plan grants access to this course
            // For simplicity, assume any active subscription grants access if course is part of *any* sub plan
            if (dbCourse.part_of_subscription_plan_id) {
                 // This logic might need to be more sophisticated, e.g., matching plan IDs.
                 // For now, if the course can be part of a subscription and user has an active one, grant access.
                hasAccess = true;
            }
          }
        }
        
        // If course is free (assuming a column like `is_free` or `stripe_price_id_single_purchase` is null and not part of sub)
        // This logic needs to be aligned with how free courses are defined in your DB.
        // E.g., if `stripe_price_id_single_purchase` is null AND `part_of_subscription_plan_id` is null.
        if (!dbCourse.stripe_price_id_single_purchase && !dbCourse.part_of_subscription_plan_id) {
            hasAccess = true; // Implicitly free course
        }


        if (!hasAccess) {
          toast({ title: "Access Denied", description: "You do not have access to this course. Please purchase it or subscribe.", variant: "destructive" });
          navigate('/courses'); // or /subscription-plans
          return;
        }

        // 3. If Access Granted, Fetch Chapters and Sections
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*, sections (*, order)') // Nested fetch for sections, order sections
          .eq('course_id', currentCourseId)
          .order('order', { ascending: true }) // Order chapters
          .order('order', { foreignTable: 'sections', ascending: true }); // Order sections within chapters


        if (chaptersError) {
          throw new Error(chaptersError.message || "Failed to fetch chapters and sections.");
        }

        const fetchedChapters: BookChapterFE[] = (chaptersData as DbChapter[]).map(ch => ({
          id: ch.id,
          title: ch.title,
          order: ch.order,
          course_id: ch.course_id,
          sections: (ch.sections as DbSection[]).map(sec => ({ // Type assertion
            id: sec.id,
            title: sec.title,
            content_html: sec.content_html,
            order: sec.order,
            chapter_id: sec.chapter_id // if needed
          })).sort((a,b) => a.order - b.order) // Ensure sections are sorted client-side too due to Supabase limitations on nested order
        })).sort((a,b) => a.order - b.order); // Ensure chapters are sorted

        setChaptersFE(fetchedChapters);

        if (fetchedChapters.length > 0 && fetchedChapters[0].sections.length > 0) {
          const firstChapterId = fetchedChapters[0].id;
          const firstSectionId = fetchedChapters[0].sections[0].id;
          const totalSections = fetchedChapters.reduce((sum, chap) => sum + chap.sections.length, 0);
          
          setBookProgressFE(prev => ({
            ...prev,
            currentChapterId: firstChapterId,
            currentSectionId: firstSectionId,
            totalPages: totalSections,
            // Load saved progress here if implementing persistence
          }));
        } else {
            // Handle case with no chapters or sections
            setBookProgressFE(prev => ({ ...prev, totalPages: 0, currentChapterId: null, currentSectionId: null }));
        }

      } catch (e: any) {
        console.error("Error in BookReader fetchData:", e);
        setError(e.message || "An unexpected error occurred.");
        toast({ title: "Error", description: e.message || "Could not load book data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseIdParam, user, authLoading, navigate, toast]);


  const handleChapterSectionChange = useCallback((chapterId: number | string, sectionId: number | string) => {
    setBookProgressFE(prev => ({
      ...prev,
      currentChapterId: chapterId,
      currentSectionId: sectionId,
      completedSectionIds: new Set(prev.completedSectionIds).add(sectionId) // Mark current section as read
    }));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const addBookmark = () => {
    if (!bookProgressFE.currentChapterId || !bookProgressFE.currentSectionId) return;
    
    const currentBookmark = {
      chapterId: bookProgressFE.currentChapterId,
      sectionId: bookProgressFE.currentSectionId,
    };

    const isBookmarked = bookProgressFE.bookmarks.some(
      b => b.chapterId === currentBookmark.chapterId && b.sectionId === currentBookmark.sectionId
    );

    if (!isBookmarked) {
      setBookProgressFE(prev => ({
        ...prev,
        bookmarks: [...prev.bookmarks, currentBookmark]
      }));
      toast({ title: "Bookmark added" });
    } else {
      setBookProgressFE(prev => ({
        ...prev,
        bookmarks: prev.bookmarks.filter(
          b => !(b.chapterId === currentBookmark.chapterId && b.sectionId === currentBookmark.sectionId)
        )
      }));
      toast({ title: "Bookmark removed" });
    }
  };

  const goToPreviousSection = () => {
    if (!bookProgressFE.currentChapterId || !bookProgressFE.currentSectionId) return;
    const currentChapterIndex = chaptersFE.findIndex(chapter => chapter.id === bookProgressFE.currentChapterId);
    if (currentChapterIndex === -1) return;

    const currentChapter = chaptersFE[currentChapterIndex];
    const currentSectionIndex = currentChapter.sections.findIndex(section => section.id === bookProgressFE.currentSectionId);
    if (currentSectionIndex === -1) return;
    
    if (currentSectionIndex > 0) {
      const prevSection = currentChapter.sections[currentSectionIndex - 1];
      handleChapterSectionChange(currentChapter.id, prevSection.id);
    } else if (currentChapterIndex > 0) {
      const prevChapter = chaptersFE[currentChapterIndex - 1];
      const lastSection = prevChapter.sections[prevChapter.sections.length - 1];
      handleChapterSectionChange(prevChapter.id, lastSection.id);
    }
  };

  const goToNextSection = () => {
    if (!bookProgressFE.currentChapterId || !bookProgressFE.currentSectionId) return;
    const currentChapterIndex = chaptersFE.findIndex(chapter => chapter.id === bookProgressFE.currentChapterId);
     if (currentChapterIndex === -1) return;

    const currentChapter = chaptersFE[currentChapterIndex];
    const currentSectionIndex = currentChapter.sections.findIndex(section => section.id === bookProgressFE.currentSectionId);
    if (currentSectionIndex === -1) return;
    
    // Mark current section as completed before moving
    setBookProgressFE(prev => ({
        ...prev,
        completedSectionIds: new Set(prev.completedSectionIds).add(bookProgressFE.currentSectionId!)
    }));

    if (currentSectionIndex < currentChapter.sections.length - 1) {
      const nextSection = currentChapter.sections[currentSectionIndex + 1];
      handleChapterSectionChange(currentChapter.id, nextSection.id);
    } else if (currentChapterIndex < chaptersFE.length - 1) {
      const nextChapter = chaptersFE[currentChapterIndex + 1];
      if (nextChapter.sections.length > 0) {
        const firstSection = nextChapter.sections[0];
        handleChapterSectionChange(nextChapter.id, firstSection.id);
      }
    }
  };

  const currentChapterObj = chaptersFE.find(chapter => chapter.id === bookProgressFE.currentChapterId);
  const currentSectionObj = currentChapterObj?.sections.find(section => section.id === bookProgressFE.currentSectionId);

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-bible-navy" />
        <p className="ml-4 text-lg">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Course</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
      </div>
    );
  }
  
  if (!courseInfo) {
     return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Course Not Found</h2>
        <p className="text-gray-500 mb-6">The course you are looking for could not be loaded.</p>
        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
      </div>
    );
  }


  const percentComplete = bookProgressFE.totalPages > 0 
    ? Math.round((bookProgressFE.completedSectionIds.size / bookProgressFE.totalPages) * 100)
    : 0;

  const isCurrentSectionBookmarked = bookProgressFE.currentChapterId && bookProgressFE.currentSectionId &&
    bookProgressFE.bookmarks.some(b => b.chapterId === bookProgressFE.currentChapterId && b.sectionId === bookProgressFE.currentSectionId);

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
    )}>
      {/* Top nav with title and controls */}
      <header className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b",
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/courses')} // Or to course details page: /courses/${courseIdParam}
            className={cn(darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900", "button-press")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium truncate hidden sm:block">{courseInfo.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={addBookmark}
            className={cn(
              isCurrentSectionBookmarked ? "text-bible-gold" : (darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"),
              "button-press"
            )}
            disabled={!bookProgressFE.currentSectionId} // Disable if no section selected
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className={cn(darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900", "button-press")}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {/* Font size slider can be re-added if needed */}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table of Contents (hidden on mobile) */}
        <aside className={cn(
          "w-64 border-r hidden md:block overflow-auto",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <TableOfContents 
            chapters={chaptersFE} 
            currentChapterId={bookProgressFE.currentChapterId}
            currentSectionId={bookProgressFE.currentSectionId}
            onSelectSection={handleChapterSectionChange}
            bookmarks={bookProgressFE.bookmarks}
            darkMode={darkMode}
          />
        </aside>

        {/* Reading pane */}
        <main className="flex-1 overflow-auto">
          <ReadingPane 
            chapter={currentChapterObj} // This is BookChapterFE
            section={currentSectionObj} // This is BookSectionFE
            fontSize={fontSize}
            darkMode={darkMode}
            onPrevious={goToPreviousSection}
            onNext={goToNextSection}
          />
        </main>
      </div>

      {/* Bottom controls */}
      <footer className={cn(
        "sticky bottom-0 border-t py-2 px-4",
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={goToPreviousSection}
              className={cn(darkMode ? "border-gray-700 hover:bg-gray-800" : "", "button-press")}
              disabled={!bookProgressFE.currentSectionId}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={goToNextSection}
              className={cn(darkMode ? "border-gray-700 hover:bg-gray-800" : "", "button-press")}
              disabled={!bookProgressFE.currentSectionId}
            >
              Next
            </Button>
          </div>
          
          <div className="w-full sm:w-1/2 flex items-center gap-2 page-fade-in" style={{animationDelay: "0.2s"}}>
            <span className="text-xs whitespace-nowrap">{percentComplete}%</span>
            <ShadProgress // Use renamed ShadProgress
              value={percentComplete} 
              className={darkMode ? "bg-gray-700 [&>*]:bg-bible-blue" : "[&>*]:bg-bible-navy"} // Customizing progress bar color
            />
            <span className="text-xs whitespace-nowrap">
              {bookProgressFE.completedSectionIds.size}/{bookProgressFE.totalPages} Sections
            </span>
          </div>
          {/* Mobile font size slider can be re-added here if necessary */}
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
