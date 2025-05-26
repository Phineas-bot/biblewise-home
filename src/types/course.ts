
// Represents a course as fetched from the database
export interface DbCourse {
  id: number; // or string if UUID
  title: string;
  author?: string | null;
  cover_image_url?: string | null;
  description?: string | null;
  category?: string | null;
  stripe_price_id_single_purchase?: string | null;
  part_of_subscription_plan_id?: string | null; // Could be a specific plan ID or a generic "all_access"
  created_at?: string;
  // any other relevant fields from your 'courses' table
}

// Represents a chapter as fetched from the database
export interface DbChapter {
  id: number; // or string if UUID
  course_id: number; // or string if UUID
  title: string;
  order: number;
  // any other relevant fields
}

// Represents a section as fetched from the database
export interface DbSection {
  id: number; // or string if UUID
  chapter_id: number; // or string if UUID
  title: string;
  content_html: string; // HTML content for the section
  order: number;
  // any other relevant fields
}


// Frontend-specific types for BookReader component
export interface BookSectionFE {
  id: number; // or string
  title: string;
  content_html: string; // Use content_html from DB
  order: number;
}

export interface BookChapterFE {
  id:number; // or string
  title: string;
  sections: BookSectionFE[];
  order: number;
  course_id?: number; // Optional if not directly used in rendering chapters list but good for context
}

// This can be a simplified version of DbCourse for the reader's context
export interface BookCourseInfo {
  id: number; // or string
  title: string;
  author?: string | null;
  cover_image_url?: string | null;
  description?: string | null;
  // other fields needed for display in reader context
}


export interface BookProgress {
  currentChapterId: number | string | null; // ID of the current chapter
  currentSectionId: number | string | null; // ID of the current section
  // readPages and totalPages might be re-evaluated based on sections
  // For example, totalPages could be total number of sections.
  // readSections could be an array of section IDs that have been marked as read.
  completedSectionIds: Set<number | string>; // Set of section IDs marked as completed
  totalPages: number; // Total number of sections in the book
  
  bookmarks: Array<{ chapterId: number | string; sectionId: number | string }>; // Store bookmarks with chapter & section context
  highlights: {
    id: string; // Unique ID for each highlight
    text: string;
    color: string;
    chapterId: number | string;
    sectionId: number | string;
    // Consider adding range data if you need to re-apply highlights to HTML
  }[];
}

// Existing types - to be reviewed if they are still needed in this form or can be replaced/merged
export type CourseStatus = "locked" | "unlocked" | "in-progress" | "completed";

export interface BookCourse { // This might be used for course listings, not the reader itself
  id: number;
  title: string;
  author: string;
  cover: string; // Potentially map cover_image_url to this
  description: string;
  category: string;
  status: CourseStatus; // This would be determined client-side based on purchases/subscriptions
  progress: number; // Calculated client-side
  isNew?: boolean; // Optional, might not come from DB directly
  isPopular?: boolean; // Optional
  lessons?: number; // Could be count of chapters or sections
  quizzes?: number[]; // IDs of associated quizzes
}
