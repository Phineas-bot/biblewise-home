
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseGrid from "@/components/CourseGrid";
import CourseFilters from "@/components/CourseFilters";
import { BookCourse } from "@/types/course";

// Sample course data
const coursesData: BookCourse[] = [
  {
    id: 1,
    title: "The Purpose Driven Life",
    author: "Rick Warren",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "unlocked",
    progress: 45,
    description: "Discover the answer to life's most fundamental question: What on earth am I here for?",
    category: "Christian Living",
    isNew: true,
    isPopular: true,
    lessons: 12,
  },
  {
    id: 2,
    title: "Mere Christianity",
    author: "C.S. Lewis",
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "in-progress",
    progress: 68,
    description: "Lewis's forceful and accessible doctrine of Christian belief.",
    category: "Theology",
    isNew: false,
    isPopular: true,
    lessons: 10,
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
  {
    id: 4,
    title: "The Cost of Discipleship",
    author: "Dietrich Bonhoeffer",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "A compelling case for the necessity of sacrificial Christian service.",
    category: "Classics",
    isNew: false,
    isPopular: true,
    lessons: 15,
  },
  {
    id: 5,
    title: "The Reason for God",
    author: "Timothy Keller",
    cover: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "unlocked",
    progress: 0,
    description: "Making a case for God in an age of skepticism.",
    category: "Apologetics",
    isNew: true,
    isPopular: true,
    lessons: 9,
  },
  {
    id: 6,
    title: "Streams in the Desert",
    author: "L. B. Cowman",
    cover: "https://images.unsplash.com/photo-1585166059783-e5dc9663fd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "completed",
    progress: 100,
    description: "Powerful devotional writings to comfort and encourage those in difficult times.",
    category: "Devotional",
    isNew: false,
    isPopular: false,
    lessons: 7,
  },
  {
    id: 7,
    title: "The Case for Christ",
    author: "Lee Strobel",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "A journalist's personal investigation of the evidence for Jesus.",
    category: "Apologetics",
    isNew: true,
    isPopular: false,
    lessons: 11,
  },
  {
    id: 8,
    title: "Celebration of Discipline",
    author: "Richard Foster",
    cover: "https://images.unsplash.com/photo-1571167530942-9d6861021b90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "in-progress",
    progress: 35,
    description: "A guide to spiritual disciplines for personal spiritual growth.",
    category: "Spiritual Growth",
    isNew: false,
    isPopular: true,
    lessons: 13,
  },
];

const CourseLibrary = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [courses, setCourses] = useState<BookCourse[]>(coursesData);
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === "all") {
      setCourses(coursesData);
    } else if (filter === "new") {
      setCourses(coursesData.filter(course => course.isNew));
    } else if (filter === "popular") {
      setCourses(coursesData.filter(course => course.isPopular));
    } else if (filter === "completed") {
      setCourses(coursesData.filter(course => course.status === "completed"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-bible-sand/30 py-10 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-bible-navy mb-3">Course Library</h1>
            <p className="text-gray-600 max-w-3xl">
              Explore our collection of Bible study courses based on transformative Christian books. 
              Deepen your knowledge and grow your faith through structured learning.
            </p>
          </div>
        </div>
        
        <section className="py-10">
          <div className="container mx-auto px-4">
            <CourseFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
            <CourseGrid courses={courses} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CourseLibrary;
