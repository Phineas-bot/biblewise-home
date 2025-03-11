
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Calendar,
  RefreshCcw,
  Receipt,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for payments
const mockPayments = [
  {
    id: "PAY-1234",
    userId: 1,
    userName: "John Smith",
    userEmail: "john@example.com",
    amount: 49.99,
    date: "2023-05-12",
    method: "Credit Card",
    status: "completed",
    subscription: "Monthly Plan",
    details: "Visa **** 4242"
  },
  {
    id: "PAY-1235",
    userId: 3,
    userName: "Michael Brown",
    userEmail: "michael@example.com",
    amount: 199.99,
    date: "2023-04-28",
    method: "PayPal",
    status: "completed",
    subscription: "Annual Plan",
    details: "michael@paypal.com"
  },
  {
    id: "PAY-1236",
    userId: 5,
    userName: "David Wilson",
    userEmail: "david@example.com",
    amount: 14.99,
    date: "2023-05-17",
    method: "Credit Card",
    status: "pending",
    subscription: "Book Purchase",
    details: "Mastercard **** 5555"
  },
  {
    id: "PAY-1237",
    userId: 4,
    userName: "Sarah Davis",
    userEmail: "sarah@example.com",
    amount: 49.99,
    date: "2023-05-02",
    method: "Credit Card",
    status: "refunded",
    subscription: "Monthly Plan",
    details: "Amex **** 9876"
  },
  {
    id: "PAY-1238",
    userId: 2,
    userName: "Alice Johnson",
    userEmail: "alice@example.com",
    amount: 49.99,
    date: "2023-05-15",
    method: "Credit Card",
    status: "completed",
    subscription: "Monthly Plan",
    details: "Visa **** 1111"
  },
  {
    id: "PAY-1239",
    userId: 6,
    userName: "Emma Taylor",
    userEmail: "emma@example.com",
    amount: 199.99,
    date: "2023-04-15",
    method: "PayPal",
    status: "completed",
    subscription: "Annual Plan",
    details: "emma@paypal.com"
  }
];

// Revenue data for the chart
const revenueData = [
  { month: 'Jan', revenue: 18520 },
  { month: 'Feb', revenue: 19250 },
  { month: 'Mar', revenue: 21450 },
  { month: 'Apr', revenue: 25750 },
  { month: 'May', revenue: 29500 },
  { month: 'Jun', revenue: 32150 },
  { month: 'Jul', revenue: 42750 },
];

interface Payment {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  subscription: string;
  details: string;
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPayments(query, statusFilter, methodFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterPayments(searchQuery, status, methodFilter);
  };

  const handleMethodFilter = (method: string) => {
    setMethodFilter(method);
    filterPayments(searchQuery, statusFilter, method);
  };

  const filterPayments = (query: string, status: string, method: string) => {
    let filtered = payments;
    
    if (query) {
      filtered = filtered.filter(payment => 
        payment.userName.toLowerCase().includes(query.toLowerCase()) || 
        payment.userEmail.toLowerCase().includes(query.toLowerCase()) ||
        payment.id.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(payment => payment.status === status);
    }
    
    if (method !== "all") {
      filtered = filtered.filter(payment => payment.method === method);
    }
    
    setFilteredPayments(filtered);
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailsOpen(true);
  };

  const totalRevenue = payments
    .filter(payment => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getTotalByStatus = (status: string) => {
    return payments
      .filter(payment => payment.status === status)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-amber-600 bg-amber-100";
      case "refunded":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "refunded":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">From all transactions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Revenue</CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalByStatus("pending").toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting processing</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Refunded Amount</CardTitle>
            <RotateCcw className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalByStatus("refunded").toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Returned to customers</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue over the past 7 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="revenue" fill="#3b5998" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by name, email, or payment ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={methodFilter}
                onValueChange={handleMethodFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[500px] rounded-md border">
            <div className="w-full">
              <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium text-gray-600">
                <div className="col-span-2">ID</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Method</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {filteredPayments.length > 0 ? (
                <div className="divide-y">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-12 p-3 hover:bg-muted/30 text-sm">
                      <div className="col-span-2 font-medium text-gray-900">{payment.id}</div>
                      <div className="col-span-2">
                        <div className="font-medium">{payment.userName}</div>
                        <div className="text-xs text-gray-500">{payment.userEmail}</div>
                      </div>
                      <div className="col-span-2 font-medium">${payment.amount.toFixed(2)}</div>
                      <div className="col-span-2 text-gray-600">{new Date(payment.date).toLocaleDateString()}</div>
                      <div className="col-span-1 text-gray-600">{payment.method}</div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-span-1 text-gray-600 text-xs">
                        {payment.subscription}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => viewPaymentDetails(payment)}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No payments found matching your criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <p>Showing {filteredPayments.length} of {payments.length} payments</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{selectedPayment.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedPayment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusIcon(selectedPayment.status)}
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-xl font-semibold">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-base">{selectedPayment.method}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.details}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Customer Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedPayment.userEmail}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Purchase Details</p>
                <div>
                  <p className="text-sm text-gray-500">Subscription Plan</p>
                  <p className="font-medium">{selectedPayment.subscription}</p>
                </div>
              </div>
              
              {selectedPayment.status !== "refunded" && (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm">
                    <Receipt className="h-4 w-4 mr-2" />
                    Send Receipt
                  </Button>
                  {selectedPayment.status === "completed" && (
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Process Refund
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
