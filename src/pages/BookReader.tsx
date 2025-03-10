
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookCourse, BookChapter, BookProgress } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import TableOfContents from '@/components/TableOfContents';
import ReadingPane from '@/components/ReadingPane';
import ReadingControls from '@/components/ReadingControls';
import { Sun, Moon, ArrowLeft, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Sample chapters data (in a real app, this would come from an API)
const sampleChapters: BookChapter[] = [
  {
    id: 1,
    title: "Introduction",
    sections: [
      {
        id: 1,
        title: "About This Book",
        content: `<p>Welcome to "The Purpose Driven Life" by Rick Warren. This spiritual journey will take you through 40 days of purpose, helping you discover God's purpose for your life.</p>
        <p>In this book, we'll explore the answers to life's most important question: What on earth am I here for? The journey is designed to be taken one day at a time, with each chapter representing a day in your 40-day spiritual journey.</p>
        <p>As you read through this book, I encourage you to take notes, reflect on the questions at the end of each chapter, and allow God to speak to you through His Word.</p>`
      },
      {
        id: 2,
        title: "How to Use This Book",
        content: `<p>This book is designed to be read as a 40-day personal spiritual journey. Here are some suggestions to help you get the most out of this experience:</p>
        <ul>
          <li>Read only one chapter a day, taking time to reflect on its message.</li>
          <li>Highlight key passages that speak to you.</li>
          <li>Write your thoughts in the margins or in a separate journal.</li>
          <li>Discuss what you're learning with a friend or small group.</li>
          <li>Apply what you learn to your daily life.</li>
        </ul>
        <p>Remember, this is not just a book to be read, but a journey to be experienced. Let's begin the adventure of discovering God's purpose for your life.</p>`
      }
    ]
  },
  {
    id: 2,
    title: "Day 1: It All Starts with God",
    sections: [
      {
        id: 3,
        title: "A Journey Begins",
        content: `<p>For everything, absolutely everything, above and below, visible and invisible, everything got started in him and finds its purpose in him. - Colossians 1:16 (MSG)</p>
        <p>It's not about you.</p>
        <p>The purpose of your life is far greater than your own personal fulfillment, your peace of mind, or even your happiness. It's far greater than your family, your career, or even your wildest dreams and ambitions. If you want to know why you were placed on this planet, you must begin with God. You were born by his purpose and for his purpose.</p>`
      },
      {
        id: 4,
        title: "Finding Your Purpose",
        content: `<p>The search for the purpose of life has puzzled people for thousands of years. That's because we typically begin at the wrong starting point—ourselves. We ask self-centered questions like: What do I want to be? What should I do with my life? What are my goals, my ambitions, my dreams for my future?</p>
        <p>But focusing on ourselves will never reveal our life's purpose. The Bible says, "It is God who directs the lives of his creatures; everyone's life is in his power."</p>
        <p>Contrary to what many popular books, movies, and seminars tell you, you won't discover your life's meaning by looking within yourself. You've probably tried that already. You didn't create yourself, so there is no way you can tell yourself what you were created for!</p>`
      }
    ]
  },
  {
    id: 3,
    title: "Day 2: You Are Not an Accident",
    sections: [
      {
        id: 5,
        title: "Planned for God's Pleasure",
        content: `<p>I am your Creator. You were in my care even before you were born. - Isaiah 44:2a (CEV)</p>
        <p>You are not an accident.</p>
        <p>Your birth was no mistake or mishap, and your life is no fluke of nature. Your parents may not have planned you, but God did. He was not at all surprised by your birth. In fact, he expected it.</p>
        <p>Long before you were conceived by your parents, you were conceived in the mind of God. He thought of you first. It is not fate, nor chance, nor luck, nor coincidence that you are breathing at this very moment. You are alive because God wanted to create you!</p>`
      },
      {
        id: 6,
        title: "God's Purpose for Creating You",
        content: `<p>The Bible says, "The LORD will fulfill his purpose for me." (Psalm 138:8)</p>
        <p>God prescribed every single detail of your body. He deliberately chose your race, the color of your skin, your hair, and every other feature. He custom-made your body just the way he wanted it. He also determined the natural talents you would possess and the uniqueness of your personality.</p>
        <p>Because God made you for a reason, he also decided when you would be born and how long you would live. He planned the days of your life in advance, choosing the exact time of your birth and death. The Bible says, "You saw me before I was born and scheduled each day of my life before I began to breathe. Every day was recorded in your Book!"</p>`
      }
    ]
  }
];

const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const courseId = parseInt(id || '1');
  
  // Sample course data
  const coursesData: BookCourse[] = [
    {
      id: 1,
      title: "The Purpose Driven Life",
      author: "Rick Warren",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      status: "in-progress",
      progress: 45,
      description: "Discover the answer to life's most fundamental question: What on earth am I here for?",
      category: "Christian Living",
      isNew: true,
      isPopular: true,
      lessons: 12,
    }
  ];

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100);
  const [course, setCourse] = useState<BookCourse | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>(sampleChapters);
  const [progress, setProgress] = useState<BookProgress>({
    currentChapter: 1,
    currentSection: 1,
    readPages: 12,
    totalPages: 40,
    bookmarks: [],
    highlights: []
  });

  useEffect(() => {
    // Find course data
    const foundCourse = coursesData.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      navigate('/courses');
    }
  }, [courseId, navigate]);

  const handleChapterChange = (chapterId: number, sectionId: number) => {
    setProgress(prev => ({
      ...prev,
      currentChapter: chapterId,
      currentSection: sectionId
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const addBookmark = () => {
    const bookmarkId = progress.currentSection;
    if (!progress.bookmarks.includes(bookmarkId)) {
      setProgress(prev => ({
        ...prev,
        bookmarks: [...prev.bookmarks, bookmarkId]
      }));
      toast({
        title: "Bookmark added",
        description: "You can find this bookmark in your library",
      });
    } else {
      setProgress(prev => ({
        ...prev,
        bookmarks: prev.bookmarks.filter(id => id !== bookmarkId)
      }));
      toast({
        title: "Bookmark removed",
        description: "Bookmark has been removed from your library",
      });
    }
  };

  const goToPreviousSection = () => {
    const currentChapterIndex = chapters.findIndex(chapter => chapter.id === progress.currentChapter);
    const currentSectionIndex = chapters[currentChapterIndex].sections.findIndex(section => section.id === progress.currentSection);
    
    if (currentSectionIndex > 0) {
      // Go to previous section in the same chapter
      const prevSection = chapters[currentChapterIndex].sections[currentSectionIndex - 1];
      handleChapterChange(progress.currentChapter, prevSection.id);
    } else if (currentChapterIndex > 0) {
      // Go to the last section of the previous chapter
      const prevChapter = chapters[currentChapterIndex - 1];
      const lastSection = prevChapter.sections[prevChapter.sections.length - 1];
      handleChapterChange(prevChapter.id, lastSection.id);
    }
  };

  const goToNextSection = () => {
    const currentChapterIndex = chapters.findIndex(chapter => chapter.id === progress.currentChapter);
    const currentSectionIndex = chapters[currentChapterIndex].sections.findIndex(section => section.id === progress.currentSection);
    
    if (currentSectionIndex < chapters[currentChapterIndex].sections.length - 1) {
      // Go to next section in the same chapter
      const nextSection = chapters[currentChapterIndex].sections[currentSectionIndex + 1];
      handleChapterChange(progress.currentChapter, nextSection.id);
    } else if (currentChapterIndex < chapters.length - 1) {
      // Go to the first section of the next chapter
      const nextChapter = chapters[currentChapterIndex + 1];
      const firstSection = nextChapter.sections[0];
      handleChapterChange(nextChapter.id, firstSection.id);
    }
  };

  const currentChapterObj = chapters.find(chapter => chapter.id === progress.currentChapter);
  const currentSectionObj = currentChapterObj?.sections.find(section => section.id === progress.currentSection);

  if (!course) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const percentComplete = Math.round((progress.readPages / progress.totalPages) * 100);

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
            onClick={() => navigate('/courses')}
            className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium truncate hidden sm:block">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={addBookmark}
            className={cn(
              progress.bookmarks.includes(progress.currentSection) ? "text-bible-gold" : "",
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="hidden md:flex items-center gap-2 w-40">
            <span className="text-xs">A-</span>
            <Slider
              value={[fontSize]}
              min={80}
              max={140}
              step={10}
              onValueChange={handleFontSizeChange}
              className={darkMode ? "bg-gray-800" : "bg-gray-100"}
            />
            <span className="text-xs">A+</span>
          </div>
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
            chapters={chapters} 
            currentChapter={progress.currentChapter}
            currentSection={progress.currentSection}
            onSelectSection={handleChapterChange}
            bookmarks={progress.bookmarks}
            darkMode={darkMode}
          />
        </aside>

        {/* Reading pane */}
        <main className="flex-1 overflow-auto">
          <ReadingPane 
            chapter={currentChapterObj} 
            section={currentSectionObj}
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
              className={darkMode ? "border-gray-700 hover:bg-gray-800" : ""}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={goToNextSection}
              className={darkMode ? "border-gray-700 hover:bg-gray-800" : ""}
            >
              Next
            </Button>
          </div>
          
          <div className="w-full sm:w-1/2 flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">{percentComplete}%</span>
            <Progress 
              value={percentComplete} 
              className={darkMode ? "bg-gray-700" : ""}
            />
            <span className="text-xs whitespace-nowrap">Page {progress.readPages}/{progress.totalPages}</span>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="text-xs">A-</span>
            <Slider
              value={[fontSize]}
              min={80}
              max={140}
              step={10}
              onValueChange={handleFontSizeChange}
              className={darkMode ? "bg-gray-800" : "bg-gray-100"}
            />
            <span className="text-xs">A+</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
