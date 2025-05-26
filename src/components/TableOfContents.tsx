
import React from 'react';
import { BookChapterFE } from '@/types/course'; // Updated type
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Bookmark } from 'lucide-react';

interface TableOfContentsProps {
  chapters: BookChapterFE[]; // Use BookChapterFE
  currentChapterId: number | string | null; // Updated prop name and type
  currentSectionId: number | string | null; // Updated prop name and type
  onSelectSection: (chapterId: number | string, sectionId: number | string) => void; // Updated signature
  bookmarks: Array<{ chapterId: number | string; sectionId: number | string }>; // Updated bookmark type
  darkMode: boolean;
}

const TableOfContents = ({ 
  chapters, 
  currentChapterId, 
  currentSectionId, 
  onSelectSection,
  bookmarks,
  darkMode
}: TableOfContentsProps) => {
  return (
    <ScrollArea className="h-full p-4">
      <h2 className={cn(
        "text-lg font-semibold mb-4 page-fade-in", // Added page-fade-in for title
        darkMode ? "text-gray-200" : "text-gray-900"
      )}>
        Table of Contents
      </h2>
      
      <div className="space-y-2 stagger-children"> {/* Added stagger-children */}
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-4"> {/* Chapter items will be animated by stagger-children */}
            <div className={cn(
              "font-medium py-1",
              darkMode ? "text-gray-300" : "text-gray-800"
            )}>
              {chapter.title}
            </div>
            
            <div className="ml-4 space-y-1">
              {chapter.sections.map((section) => (
                <div 
                  key={section.id} 
                  onClick={() => onSelectSection(chapter.id, section.id)}
                  className={cn(
                    "flex items-center gap-2 py-1 px-2 text-sm cursor-pointer rounded group", // Added group for potential group-hover effects
                    currentChapterId === chapter.id && currentSectionId === section.id
                      ? darkMode 
                        ? "bg-bible-navy text-white" 
                        : "bg-bible-blue/10 text-bible-blue font-semibold" // Added font-semibold for active
                      : darkMode 
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" // Added hover background for dark mode
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100", // Added hover background for light mode
                    "transition-colors duration-200"
                  )}
                >
                  {currentChapterId === chapter.id && currentSectionId === section.id ? (
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-bible-gold" />
                  ) : (
                     <span className="w-3 h-3 flex-shrink-0"></span> // Placeholder for alignment
                  )}
                  <span className="truncate">{section.title}</span>
                  {bookmarks.some(b => b.chapterId === chapter.id && b.sectionId === section.id) && (
                    <Bookmark className="h-3 w-3 flex-shrink-0 text-bible-gold ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TableOfContents;
