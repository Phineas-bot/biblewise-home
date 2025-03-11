
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Upload,
  Edit,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
  FileText,
  Image
} from "lucide-react";
import { BookCourse } from "@/types/course";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for courses
const mockCourses: BookCourse[] = [
  {
    id: 1,
    title: "The Way of Life",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1613592181949-e31d3913731b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80",
    description: "Introduction to the Christian life and the basics of walking with Christ.",
    category: "Foundation",
    status: "unlocked",
    progress: 100,
    isNew: false,
    isPopular: true,
    lessons: 10
  },
  {
    id: 2,
    title: "The Way of Discipleship",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1555116505-38ab61800975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    description: "Learning to follow Christ and become like Him in character and conduct.",
    category: "Discipleship",
    status: "unlocked",
    progress: 75,
    isNew: false,
    isPopular: true,
    lessons: 12
  },
  {
    id: 3,
    title: "The Way of Sanctification",
    author: "Prof. Zacharias Tanee Fomum",
    cover: "https://images.unsplash.com/photo-1532686255137-e39a94abee95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80",
    description: "Growing in holiness and separating oneself from worldly influences.",
    category: "Sanctification",
    status: "locked",
    progress: 0,
    isNew: true,
    isPopular: false,
    lessons: 15
  }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState<BookCourse[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<BookCourse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<BookCourse>>({
    author: "Prof. Zacharias Tanee Fomum",
    status: "locked",
    progress: 0,
    isNew: true,
    isPopular: false,
    lessons: 1
  });

  const handleEditCourse = (course: BookCourse) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: BookCourse) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCourse = () => {
    // In a real application, this would send data to an API
    if (selectedCourse) {
      const updatedCourses = courses.map(course => 
        course.id === selectedCourse.id ? selectedCourse : course
      );
      setCourses(updatedCourses);
    }
    setIsEditDialogOpen(false);
  };

  const confirmDeleteCourse = () => {
    // In a real application, this would send a request to an API
    if (selectedCourse) {
      const updatedCourses = courses.filter(course => course.id !== selectedCourse.id);
      setCourses(updatedCourses);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleAddCourse = () => {
    // In a real application, this would send data to an API
    const id = Math.max(...courses.map(course => course.id)) + 1;
    const courseToAdd = {
      ...(newCourse as BookCourse),
      id
    };
    setCourses([...courses, courseToAdd]);
    setIsAddDialogOpen(false);
    // Reset newCourse for next addition
    setNewCourse({
      author: "Prof. Zacharias Tanee Fomum",
      status: "locked",
      progress: 0,
      isNew: true,
      isPopular: false,
      lessons: 1
    });
  };

  const toggleCourseStatus = (courseId: number) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          status: course.status === "locked" ? "unlocked" : "locked"
        };
      }
      return course;
    });
    setCourses(updatedCourses);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Manage books and courses in The Christian Way Series</CardDescription>
            </div>
            <Button 
              className="bg-bible-navy hover:bg-bible-blue"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[650px] rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gray-100">
                    <img 
                      src={course.cover} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCourse(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center rounded-full bg-bible-navy/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">by {course.author}</p>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">{course.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">
                          {course.status === "locked" ? "Locked" : "Unlocked"}
                        </span>
                        <Switch 
                          checked={course.status === "unlocked"} 
                          onCheckedChange={() => toggleCourseStatus(course.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Add a new book to The Christian Way Series
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm">
                Title
              </label>
              <Input
                id="title"
                placeholder="Book title"
                className="col-span-3"
                value={newCourse.title || ""}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm">
                Category
              </label>
              <Select
                value={newCourse.category}
                onValueChange={(value) => setNewCourse({...newCourse, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Discipleship">Discipleship</SelectItem>
                  <SelectItem value="Sanctification">Sanctification</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Ministry">Ministry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-sm pt-2">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Book description"
                className="col-span-3"
                rows={3}
                value={newCourse.description || ""}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="coverImage" className="text-right text-sm">
                Cover Image
              </label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="coverImage"
                    placeholder="Cover image URL"
                    value={newCourse.cover || ""}
                    onChange={(e) => setNewCourse({...newCourse, cover: e.target.value})}
                  />
                  <Button variant="outline" className="flex-shrink-0">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lessons" className="text-right text-sm">
                Lessons
              </label>
              <Input
                id="lessons"
                type="number"
                min="1"
                className="col-span-3"
                value={newCourse.lessons}
                onChange={(e) => setNewCourse({...newCourse, lessons: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm">
                Options
              </div>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isNew" className="flex items-center gap-2">
                    <span>Mark as New</span>
                  </Label>
                  <Switch 
                    id="isNew"
                    checked={newCourse.isNew} 
                    onCheckedChange={(checked) => setNewCourse({...newCourse, isNew: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPopular" className="flex items-center gap-2">
                    <span>Mark as Popular</span>
                  </Label>
                  <Switch 
                    id="isPopular"
                    checked={newCourse.isPopular} 
                    onCheckedChange={(checked) => setNewCourse({...newCourse, isPopular: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isUnlocked" className="flex items-center gap-2">
                    <span>Unlock for all users</span>
                  </Label>
                  <Switch 
                    id="isUnlocked"
                    checked={newCourse.status === "unlocked"} 
                    onCheckedChange={(checked) => setNewCourse({
                      ...newCourse, 
                      status: checked ? "unlocked" : "locked"
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCourse}
              disabled={!newCourse.title || !newCourse.description || !newCourse.cover || !newCourse.category}
            >
              Add Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update book details and availability
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-title" className="text-right text-sm">
                  Title
                </label>
                <Input
                  id="edit-title"
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-category" className="text-right text-sm">
                  Category
                </label>
                <Select
                  value={selectedCourse.category}
                  onValueChange={(value) => setSelectedCourse({...selectedCourse, category: value})}
                >
                  <SelectTrigger id="edit-category" className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Discipleship">Discipleship</SelectItem>
                    <SelectItem value="Sanctification">Sanctification</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="edit-description" className="text-right text-sm pt-2">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={selectedCourse.description}
                  onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-cover" className="text-right text-sm">
                  Cover Image
                </label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-cover"
                      value={selectedCourse.cover}
                      onChange={(e) => setSelectedCourse({...selectedCourse, cover: e.target.value})}
                    />
                    <Button variant="outline" className="flex-shrink-0">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-lessons" className="text-right text-sm">
                  Lessons
                </label>
                <Input
                  id="edit-lessons"
                  type="number"
                  min="1"
                  value={selectedCourse.lessons}
                  onChange={(e) => setSelectedCourse({
                    ...selectedCourse, 
                    lessons: parseInt(e.target.value) || selectedCourse.lessons
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm">
                  Options
                </div>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-isNew" className="flex items-center gap-2">
                      <span>Mark as New</span>
                    </Label>
                    <Switch 
                      id="edit-isNew"
                      checked={selectedCourse.isNew} 
                      onCheckedChange={(checked) => setSelectedCourse({...selectedCourse, isNew: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-isPopular" className="flex items-center gap-2">
                      <span>Mark as Popular</span>
                    </Label>
                    <Switch 
                      id="edit-isPopular"
                      checked={selectedCourse.isPopular} 
                      onCheckedChange={(checked) => setSelectedCourse({...selectedCourse, isPopular: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-status" className="flex items-center gap-2">
                      <span>Unlock for all users</span>
                    </Label>
                    <Switch 
                      id="edit-status"
                      checked={selectedCourse.status === "unlocked"} 
                      onCheckedChange={(checked) => setSelectedCourse({
                        ...selectedCourse, 
                        status: checked ? "unlocked" : "locked"
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedCourse.cover} 
                    alt={selectedCourse.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedCourse.title}</h4>
                  <p className="text-sm text-gray-500">{selectedCourse.category}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCourse}
            >
              Delete Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
