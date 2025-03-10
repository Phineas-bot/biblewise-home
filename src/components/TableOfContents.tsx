
import React from 'react';
import { BookChapter } from '@/types/course';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Bookmark } from 'lucide-react';

interface TableOfContentsProps {
  chapters: BookChapter[];
  currentChapter: number;
  currentSection: number;
  onSelectSection: (chapterId: number, sectionId: number) => void;
  bookmarks: number[];
  darkMode: boolean;
}

const TableOfContents = ({ 
  chapters, 
  currentChapter, 
  currentSection, 
  onSelectSection,
  bookmarks,
  darkMode
}: TableOfContentsProps) => {
  return (
    <ScrollArea className="h-full p-4">
      <h2 className={cn(
        "text-lg font-semibold mb-4",
        darkMode ? "text-gray-200" : "text-gray-900"
      )}>
        Table of Contents
      </h2>
      
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-4">
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
                    "flex items-center gap-2 py-1 px-2 text-sm cursor-pointer rounded",
                    currentChapter === chapter.id && currentSection === section.id
                      ? darkMode 
                        ? "bg-bible-navy text-white" 
                        : "bg-bible-blue/10 text-bible-blue"
                      : darkMode 
                        ? "text-gray-400 hover:text-gray-200" 
                        : "text-gray-600 hover:text-gray-900",
                    "transition-colors duration-200"
                  )}
                >
                  {currentChapter === chapter.id && currentSection === section.id && (
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{section.title}</span>
                  {bookmarks.includes(section.id) && (
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
