
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
  Search,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    status: "paid",
    progress: 45,
    joined: "2023-05-12"
  },
  {
    id: 2,
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "free",
    progress: 25,
    joined: "2023-06-23"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    status: "paid",
    progress: 80,
    joined: "2023-03-17"
  },
  {
    id: 4,
    name: "Sarah Davis",
    email: "sarah@example.com",
    status: "free",
    progress: 10,
    joined: "2023-07-08"
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    status: "paid",
    progress: 65,
    joined: "2023-04-29"
  },
  {
    id: 6,
    name: "Emma Taylor",
    email: "emma@example.com",
    status: "admin",
    progress: 100,
    joined: "2023-01-15"
  }
];

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  progress: number;
  joined: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterUsers(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterUsers(searchQuery, status);
  };

  const filterUsers = (query: string, status: string) => {
    let filtered = mockUsers;
    
    if (query) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(user => user.status === status);
    }
    
    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    // In a real application, this would send data to an API
    setIsEditDialogOpen(false);
    // Update the user in the users array
    if (selectedUser) {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      );
      setUsers(updatedUsers);
      filterUsers(searchQuery, statusFilter);
    }
  };

  const handleDeleteUser = (userId: number) => {
    // In a real application, this would send a request to an API
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => {
      let match = true;
      if (statusFilter !== "all") {
        match = user.status === statusFilter;
      }
      if (searchQuery) {
        match = match && (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return match;
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage your platform users and their access</CardDescription>
            </div>
            <Button className="bg-bible-navy hover:bg-bible-blue">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="free">Free Users</SelectItem>
                <SelectItem value="paid">Paid Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[460px] rounded-md border">
            <div className="w-full">
              <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium text-gray-600">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 p-3 hover:bg-muted/30 text-sm">
                      <div className="col-span-3 font-medium text-gray-900">{user.name}</div>
                      <div className="col-span-3 text-gray-600">{user.email}</div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div 
                            className={`h-2 rounded-full ${
                              user.progress >= 80 
                                ? 'bg-green-500' 
                                : user.progress >= 40 
                                ? 'bg-bible-blue' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${user.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{user.progress}%</span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <p>Showing {filteredUsers.length} of {users.length} users</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and subscription status
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Name
                </label>
                <Input
                  id="name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right text-sm">
                  Status
                </label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
