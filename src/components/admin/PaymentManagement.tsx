
import { useState, useEffect } from "react"; // Import useEffect
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
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
  Eye,
  Loader2, // Added Loader
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define a more comprehensive Payment interface
interface AugmentedPayment {
  id: string; // purchase_id (stripe_payment_intent_id) or subscription_id (stripe_subscription_id)
  userId: string; // Supabase auth user ID
  userName: string; // From profiles table (full_name)
  userEmail: string; // From auth.users table (email)
  amount: number; // In dollars
  date: string; // Transaction date (created_at for purchases, current_period_start for subs)
  method: string; // e.g., "Stripe" - derived or default
  status: string; // purchase status or subscription status
  productName: string; // Name of the product/plan from 'products' table
  details: string; // e.g., "Course: Intro to Bible", "Subscription ID: sub_xxx"
  type: 'purchase' | 'subscription'; // Distinguish the source
  stripeCustomerId?: string | null;
  courseId?: string | null; // For purchases
  stripeSubscriptionId?: string | null; // For subscriptions
  currentPeriodEnd?: string | null; // For subscriptions
}

// Initial empty state for revenue data
const initialRevenueData: { month: string, revenue: number }[] = [];

const PaymentManagement = () => {
  const [allPayments, setAllPayments] = useState<AugmentedPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<AugmentedPayment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all"); // Note: method is less defined now
  const [selectedPayment, setSelectedPayment] = useState<AugmentedPayment | null>(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState(initialRevenueData);


  useEffect(() => {
    const fetchPaymentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Purchases
        // Assuming 'profiles' has 'id' (matches user_id) and 'full_name'
        // Assuming 'auth.users' has 'id' and 'email'
        // Assuming 'products' has 'id' and 'name'
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            id, 
            user_id, 
            amount, 
            created_at, 
            status, 
            stripe_payment_intent_id, 
            stripe_customer_id, 
            course_id,
            products (name),
            profiles (full_name),
            users:auth_users (email) 
          `) // Using a custom alias 'auth_users' for the join target if needed, or Supabase might infer relation.
          // If direct join to auth.users is not standard, adjust to query separately or rely on profiles.email if populated.
          // For this example, let's assume a view or relation `users` can access `email` via `user_id`.
          // A more direct way if `profiles` doesn't have email: fetch profiles, then map user_ids to fetch emails from auth.users.
          // Simplified: let's assume profiles table is extended or we fetch emails separately.
          // For now, the SQL implies a join like `purchases.user_id = profiles.id` and `purchases.user_id = users.id`.
          // If `users` is not a direct relation, this select string needs adjustment or post-processing.
          // Let's assume `profiles` contains `email` or we join `auth.users` via `user_id`.
          // Corrected select assuming profiles contains full_name and we fetch email from auth.users separately if needed.
          // For simplicity, let's assume profiles has email for now, or use a placeholder.
          // The SQL for table creation did not put email in profiles.
          // So, we need to fetch users (auth.users) separately or adjust the schema.
          // Let's try to select email from auth.users table. Supabase JS client allows this if RLS permits.
          // The table is `auth.users`, not just `users`.
          // The select string should be: `profiles!inner(full_name), users:auth.users!inner(email)`
          // This is still complex. Let's simplify: fetch `profiles(full_name)` and then for each user_id, fetch email from `auth.users`.
          // Simpler for now: fetch email from auth.users table directly in the join if RLS is set up for service_role.
          // The join syntax for Supabase JS client is `table!fk_column(columns)`.
          // So, `profiles!purchases_user_id_fkey(full_name)`. This is if FK is explicitly named.
          // Default is `profiles(full_name)`.
          // And for auth.users it would be `auth_users:auth.users(email)`.
          // The query will be:
          // purchases: id, user_id, amount, ..., profiles(full_name), users:auth.users(email)
          // products: id, name
          // subscriptions: id, user_id, status, ..., profiles(full_name), users:auth.users(email), products(name, price)
          .order('created_at', { ascending: false });

        if (purchasesError) {
          console.error("Supabase query error (purchases):", JSON.stringify(purchasesError, null, 2));
          throw new Error(`Failed to fetch purchases: ${purchasesError.message}`);
        }
        
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select(`
            id, 
            user_id, 
            status, 
            stripe_subscription_id, 
            stripe_customer_id, 
            current_period_start, 
            current_period_end,
            products (name, price),
            profiles (full_name) 
          `) // Email will be fetched separately for users in subscriptions
          .order('created_at', { ascending: false });

        if (subscriptionsError) {
          console.error("Supabase query error (subscriptions):", JSON.stringify(subscriptionsError, null, 2));
          throw new Error(`Failed to fetch subscriptions: ${subscriptionsError.message}`);
        }
        
        // Fetch emails for users found in subscriptions if not directly joinable easily
        const userIdsFromSubs = subscriptionsData?.map(s => s.user_id).filter(Boolean) || [];
        const userIdsFromPurchases = purchasesData?.map(p => p.user_id).filter(Boolean) || [];
        const allUserIds = [...new Set([...userIdsFromSubs, ...userIdsFromPurchases])];
        
        let userEmailsMap: Map<string, string> = new Map();
        if (allUserIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
                .from('users') // This should be 'auth.users' but Supabase client might abstract it or need specific handling for auth schema
                               // For admin panel, direct query to auth.users might be restricted.
                               // Let's assume a 'users' view or table exists that mirrors relevant auth.users fields and is queryable.
                               // If not, this needs to be `supabase.auth.admin.listUsers()` and then map. That's more complex.
                               // For now, proceeding with 'users' table/view assumption or direct auth.users query with service key.
                               // The SQL in previous subtask created `profiles` with `id` referencing `auth.users(id)`.
                               // Let's use the `auth.users` table directly, as service role key should allow it.
                .from('profiles') // Let's assume profiles has user_id and we can get email via user_id from auth.users
                .select('id, users_data:users(email)') // This custom join needs to be set up in DB or use separate queries
                                                      // Simplified: Fetch all profiles, then iterate and fetch emails
                                                      // OR, if RLS allows, query auth.users directly.
                                                      // Most robust: create a DB function `get_user_email(user_id)`
                                                      // For now, let's assume `profiles` table has an `email` column (needs schema change)
                                                      // Or, for simplicity in this step, use a placeholder if email is not in `profiles`.
                                                      // The provided `profiles` schema does not have email.
                                                      // Let's fetch from `auth.users` directly.
                .select('id, email')
                .in('id', allUserIds);

            if (usersError) {
                 console.warn("Could not fetch user emails, using placeholders:", usersError.message);
            } else {
                usersData?.forEach(u => userEmailsMap.set(u.id, u.email || 'N/A'));
            }
        }


        const augmentedPurchases: AugmentedPayment[] = purchasesData?.map((p: any) => ({
          id: p.stripe_payment_intent_id || p.id,
          userId: p.user_id,
          userName: p.profiles?.full_name || 'N/A',
          userEmail: userEmailsMap.get(p.user_id) || 'N/A',
          amount: p.amount / 100, // Convert cents to dollars
          date: new Date(p.created_at).toISOString(),
          method: 'Stripe', // Placeholder
          status: p.status,
          productName: p.products?.name || 'Unknown Product',
          details: p.course_id ? `Course ID: ${p.course_id}` : `Purchase: ${p.products?.name || 'Item'}`,
          type: 'purchase',
          stripeCustomerId: p.stripe_customer_id,
          courseId: p.course_id,
        })) || [];

        const augmentedSubscriptions: AugmentedPayment[] = subscriptionsData?.map((s: any) => ({
          id: s.stripe_subscription_id || s.id,
          userId: s.user_id,
          userName: s.profiles?.full_name || 'N/A',
          userEmail: userEmailsMap.get(s.user_id) || 'N/A',
          amount: (s.products?.price || 0) / 100, // Convert cents to dollars
          date: new Date(s.current_period_start).toISOString(),
          method: 'Stripe', // Placeholder
          status: s.status,
          productName: s.products?.name || 'Unknown Subscription',
          details: `Subscription ID: ${s.stripe_subscription_id}`,
          type: 'subscription',
          stripeCustomerId: s.stripe_customer_id,
          stripeSubscriptionId: s.stripe_subscription_id,
          currentPeriodEnd: new Date(s.current_period_end).toISOString(),
        })) || [];
        
        const combinedPayments = [...augmentedPurchases, ...augmentedSubscriptions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllPayments(combinedPayments);
        setFilteredPayments(combinedPayments); // Initialize filteredPayments
        generateRevenueChartData(combinedPayments);

      } catch (err: any) {
        console.error("Error fetching payment data:", err);
        setError(err.message || "Failed to fetch payment data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);
  
  const generateRevenueChartData = (paymentsToChart: AugmentedPayment[]) => {
    const monthlyRevenue: { [key: string]: number } = {};
    paymentsToChart.forEach(payment => {
      // Consider 'active' for subscriptions as completed for the period's revenue contribution
      if (payment.status === 'succeeded' || payment.status === 'active' || payment.status === 'completed') { 
        const dateObj = new Date(payment.date);
        // Ensure date is valid before processing
        if (!isNaN(dateObj.getTime())) {
            const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + payment.amount;
        }
      }
    });
  
    const chartData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))
      .sort((a, b) => {
        // Convert "MMM YY" to a sortable date
        const [aMonthStr, aYearStr] = a.month.split(' ');
        const [bMonthStr, bYearStr] = b.month.split(' ');
        const aDate = new Date(`${aMonthStr} 1, 20${aYearStr}`);
        const bDate = new Date(`${bMonthStr} 1, 20${bYearStr}`);
        return aDate.getTime() - bDate.getTime();
      })
      .slice(-7); // Show last 7 months or adjust as needed
  
    setRevenueData(chartData);
  };


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
    let filtered = allPayments; // Filter from all fetched payments
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.userName.toLowerCase().includes(lowerQuery) || 
        payment.userEmail.toLowerCase().includes(lowerQuery) ||
        payment.id.toLowerCase().includes(lowerQuery) ||
        payment.productName.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === status.toLowerCase());
    }
    
    // Method filter might need adjustment as 'method' is now mostly "Stripe"
    if (method !== "all") {
      filtered = filtered.filter(payment => payment.method.toLowerCase() === method.toLowerCase());
    }
    
    setFilteredPayments(filtered);
  };

  const viewPaymentDetails = (payment: AugmentedPayment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailsOpen(true);
  };

  const totalRevenue = allPayments
    .filter(payment => payment.status === "succeeded" || payment.status === "active" || payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const getTotalByStatus = (status: string) => {
    return allPayments
      .filter(payment => payment.status.toLowerCase() === status.toLowerCase())
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusColor = (status: string) => {
    if (!status) return "text-gray-600 bg-gray-100"; // Default for undefined status
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "completed": // Generic completed for direct purchases
      case "succeeded": // Stripe specific for purchases
      case "active":    // Stripe specific for subscriptions
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-amber-600 bg-amber-100";
      case "refunded": 
      case "canceled": // Stripe specific for subscriptions
      case "past_due": // Stripe specific for subscriptions
      case "failed":   // Stripe specific for purchases
      case "incomplete": // Stripe specific
      case "incomplete_expired": // Stripe specific
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "completed":
      case "succeeded":
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "refunded":
      case "canceled":
      case "past_due":
      case "failed":
      case "incomplete":
      case "incomplete_expired":
        return <RotateCcw className="h-4 w-4" />; // Using RotateCcw for various non-success states
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
                <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `${label}`}
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
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-bible-navy" />
              <p className="ml-2">Loading payment data...</p>
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 py-4">
              <p>Error: {error}</p>
              <Button onClick={() => { /* Re-trigger fetchPaymentData or reload */ window.location.reload(); }} variant="outline" className="mt-2">Retry</Button>
            </div>
          )}
          {!isLoading && !error && (
            <>
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
                  <SelectItem value="succeeded">Succeeded (Purchase)</SelectItem>
                  <SelectItem value="active">Active (Subscription)</SelectItem>
                  <SelectItem value="completed">Completed (Legacy)</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="canceled">Canceled (Subscription)</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="incomplete_expired">Incomplete Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={methodFilter}
                onValueChange={handleMethodFilter}
                disabled={true} // Disabled as method is now mostly "Stripe"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by method (Stripe)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem> {/* Only option for now */}
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
                {/* <div className="col-span-1">Method</div> Method column removed from header */}
                <div className="col-span-2">Status</div> {/* Increased span for status */}
                <div className="col-span-1">Type</div> {/* Product/Plan Name */}
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {filteredPayments.length > 0 ? (
                <div className="divide-y">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-12 p-3 hover:bg-muted/30 text-sm">
                      <div className="col-span-2 font-medium text-gray-900 truncate" title={payment.id}>{payment.id}</div>
                      <div className="col-span-2">
                        <div className="font-medium truncate" title={payment.userName}>{payment.userName}</div>
                        <div className="text-xs text-gray-500 truncate" title={payment.userEmail}>{payment.userEmail}</div>
                      </div>
                      <div className="col-span-2 font-medium">${payment.amount.toFixed(2)}</div>
                      <div className="col-span-2 text-gray-600">{new Date(payment.date).toLocaleDateString()}</div>
                      {/* <div className="col-span-1 text-gray-600">{payment.method}</div> Method column removed */}
                      <div className="col-span-2"> {/* Increased span */}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-1 text-gray-600 text-xs truncate" title={payment.productName}>
                        {payment.productName}
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
            <p>Showing {filteredPayments.length} of {allPayments.length} payments</p>
            {/* Basic Pagination (can be enhanced later) */}
            {/* <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div> */}
          </div>
          </>
        )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction. Actions are disabled.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium truncate" title={selectedPayment.id}>{selectedPayment.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedPayment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusIcon(selectedPayment.status)}
                  {selectedPayment.status ? selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1) : 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-xl font-semibold">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-base capitalize">{selectedPayment.type}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                 <p className="text-sm font-medium text-gray-500 mb-1">Product/Plan</p>
                 <p className="font-medium truncate" title={selectedPayment.productName}>{selectedPayment.productName}</p>
                 {selectedPayment.courseId && (
                    <p className="text-xs text-gray-500 mt-0.5">Course ID: {selectedPayment.courseId}</p>
                 )}
                 {selectedPayment.stripeSubscriptionId && (
                    <p className="text-xs text-gray-500 mt-0.5">Sub ID: {selectedPayment.stripeSubscriptionId}</p>
                 )}
                 {selectedPayment.currentPeriodEnd && selectedPayment.type === 'subscription' && (
                    <p className="text-xs text-gray-500 mt-0.5">Renews/Ends: {new Date(selectedPayment.currentPeriodEnd).toLocaleDateString()}</p>
                 )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Customer Information</p>
                <div className="grid grid-cols-1 gap-y-1">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium truncate" title={selectedPayment.userName}>{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium truncate" title={selectedPayment.userEmail}>{selectedPayment.userEmail}</p>
                  </div>
                </div>
                 {selectedPayment.stripeCustomerId && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Stripe Customer ID</p>
                    <p className="font-medium truncate text-xs" title={selectedPayment.stripeCustomerId}>{selectedPayment.stripeCustomerId}</p>
                  </div>
                )}
              </div>
              
              {/* Removed original "Purchase Details" section as info is merged above */}
              
              {selectedPayment.status && selectedPayment.status.toLowerCase() !== "refunded" && selectedPayment.status.toLowerCase() !== "canceled" && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" size="sm" disabled> {/* Disabled as per requirement */}
                    <Receipt className="h-4 w-4 mr-2" />
                    Send Receipt
                  </Button>
                  {(selectedPayment.status.toLowerCase() === "completed" || selectedPayment.status.toLowerCase() === "succeeded" || selectedPayment.status.toLowerCase() === "active") && (
                    <Button variant="destructive" size="sm" disabled> {/* Disabled as per requirement */}
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
