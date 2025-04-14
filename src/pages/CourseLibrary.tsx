import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseGrid from "@/components/CourseGrid";
import CourseFilters from "@/components/CourseFilters";
import { BookCourse } from "@/types/course";

const coursesData: BookCourse[] = [
  {
    id: 1,
    title: "The Way of Life",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "/lovable-uploads/96e4e601-e7c0-48b9-969c-4cdb885df0ec.png",
    status: "unlocked",
    progress: 45,
    description: "The foundational course on understanding salvation through Christ and its implications for daily living.",
    category: "Christian Way Series",
    isNew: true,
    isPopular: true,
    lessons: 12,
  },
  {
    id: 2,
    title: "The Way of Obedience",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn the principles of biblical obedience and how to follow God's commands wholeheartedly.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 10,
  },
  {
    id: 3,
    title: "The Way of Discipleship",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn the principles of biblical discipleship and how to follow Christ wholeheartedly.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 10,
  },
  {
    id: 4,
    title: "The Way of Sanctification",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Explore the process of spiritual growth and becoming more like Christ in character and conduct.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 9,
  },
  {
    id: 5,
    title: "The Way of Christian Character",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1571167530942-9d6861021b90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Develop godly character traits that reflect Christ's nature in your daily interactions.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 10,
  },
  {
    id: 6,
    title: "The Way of Spiritual Power",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn how to walk in the power of the Holy Spirit for effective Christian living and ministry.",
    category: "Christian Way Series",
    isNew: true,
    isPopular: false,
    lessons: 9,
  },
  {
    id: 7,
    title: "The Way of Christian Service",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1585166059783-e5dc9663fd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn how to serve God effectively in various capacities within the body of Christ.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 11,
  },
  {
    id: 8,
    title: "The Way of Spiritual Warfare",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Understand the principles of spiritual warfare and how to stand firm against the enemy's attacks.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 13,
  },
  {
    id: 9,
    title: "The Way of Suffering For Christ",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Understand the significance of suffering for Christ and how to maintain faith during difficult times.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 8,
  },
  {
    id: 10,
    title: "The Way of Overcomers",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1585166059783-e5dc9663fd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn strategies for overcoming spiritual challenges and living a victorious Christian life.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 10,
  },
  {
    id: 11,
    title: "The Way of Spiritual Encouragement",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Learn how to provide spiritual encouragement and support to fellow believers.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 9,
  },
  {
    id: 12,
    title: "The Way of Loving The Lord",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    status: "locked",
    progress: 0,
    description: "Deepen your love and relationship with God through understanding and passionate devotion.",
    category: "Christian Way Series",
    isNew: false,
    isPopular: false,
    lessons: 12,
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
            <h1 className="text-3xl md:text-4xl font-bold text-bible-navy mb-3">The Christian Way Series</h1>
            <p className="text-gray-600 max-w-3xl">
              A comprehensive 12-book collection by Prof. Zacharias Tanee Fomum that guides believers through every aspect of 
              Christian life, from salvation to ministry effectiveness.
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
