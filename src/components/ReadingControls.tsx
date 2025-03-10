
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Bookmark, Share, HighlighterIcon, BookMarkedIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingControlsProps {
  darkMode: boolean;
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

const ReadingControls = ({
  darkMode,
  fontSize,
  onFontSizeChange,
  onBookmark,
  isBookmarked
}: ReadingControlsProps) => {
  return (
    <div className={cn(
      "flex items-center justify-center gap-4 p-3",
      darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-xs">A-</span>
        <Slider
          value={[fontSize]}
          min={80}
          max={140}
          step={10}
          onValueChange={onFontSizeChange}
          className="w-28"
        />
        <span className="text-xs">A+</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onBookmark}
        className={isBookmarked ? "text-bible-gold" : ""}
      >
        <Bookmark className="h-5 w-5" />
      </Button>
      
      <Button variant="ghost" size="icon">
        <HighlighterIcon className="h-5 w-5" />
      </Button>
      
      <Button variant="ghost" size="icon">
        <BookMarkedIcon className="h-5 w-5" />
      </Button>
      
      <Button variant="ghost" size="icon">
        <Share className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ReadingControls;
