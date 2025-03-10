
export type CourseStatus = "locked" | "unlocked" | "in-progress" | "completed";

export interface BookCourse {
  id: number;
  title: string;
  author: string;
  cover: string;
  description: string;
  category: string;
  status: CourseStatus;
  progress: number;
  isNew: boolean;
  isPopular: boolean;
  lessons: number;
}
