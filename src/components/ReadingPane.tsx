
import React from 'react';
import { BookChapter, BookSection } from '@/types/course';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReadingPaneProps {
  chapter?: BookChapter;
  section?: BookSection;
  fontSize: number;
  darkMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const ReadingPane = ({ 
  chapter, 
  section, 
  fontSize, 
  darkMode,
  onPrevious,
  onNext
}: ReadingPaneProps) => {
  if (!chapter || !section) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No content selected</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Navigation overlay buttons (visible on hover) */}
      <div className="absolute top-0 left-0 h-full w-16 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={onPrevious}
          className={cn(
            "p-2 rounded-full",
            darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      
      <div className="absolute top-0 right-0 h-full w-16 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={onNext}
          className={cn(
            "p-2 rounded-full",
            darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-full">
        <div className="mb-8">
          <h2 className={cn(
            "text-2xl font-bold mb-2",
            darkMode ? "text-gray-200" : "text-gray-900"
          )}>
            {chapter.title}
          </h2>
          <h3 className={cn(
            "text-xl font-semibold",
            darkMode ? "text-gray-300" : "text-gray-700"
          )}>
            {section.title}
          </h3>
        </div>
        
        <div 
          className={cn(
            "prose max-w-none",
            darkMode ? "prose-invert" : "",
            "prose-headings:font-semibold prose-p:mb-4 prose-li:marker:text-bible-blue"
          )}
          style={{ 
            fontSize: `${fontSize}%`,
            lineHeight: 1.8
          }}
          dangerouslySetInnerHTML={{ __html: section.content }}
        />
      </div>
    </div>
  );
};

export default ReadingPane;
