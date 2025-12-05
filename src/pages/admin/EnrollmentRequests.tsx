import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, Check, X, Clock, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  trx_id: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  courses: {
    title: string;
  };
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

const EnrollmentRequests = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select(`
          *,
          courses(title)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        const transactionsWithProfiles = data.map(t => ({
          ...t,
          profile: profileMap.get(t.user_id) || null,
        }));
        setTransactions(transactionsWithProfiles);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load enrollment requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transaction: Transaction) => {
    setProcessing(transaction.id);
    try {
      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          student_id: transaction.user_id,
          course_id: transaction.course_id,
          progress_percentage: 0,
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          enrollment_id: enrollment.id,
        })
        .eq("id", transaction.id);

      if (txError) throw txError;

      // Create notification for student
      await supabase.from("notifications").insert({
        user_id: transaction.user_id,
        title: "Enrollment Approved!",
        message: `Your enrollment for "${transaction.courses?.title}" has been approved. You can now access the course.`,
        type: "success",
        link: `/student/course/${transaction.course_id}`,
      });

      toast({
        title: "Approved!",
        description: "Student has been enrolled in the course.",
      });

      fetchTransactions();
    } catch (error: any) {
      console.error("Error approving:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve enrollment.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.id) return;

    setProcessing(rejectDialog.id);
    try {
      const transaction = transactions.find(t => t.id === rejectDialog.id);
      
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "rejected",
          completed_at: new Date().toISOString(),
          error_message: "Payment verification failed or invalid transaction ID.",
        })
        .eq("id", rejectDialog.id);

      if (error) throw error;

      // Create notification for student
      if (transaction) {
        await supabase.from("notifications").insert({
          user_id: transaction.user_id,
          title: "Enrollment Not Approved",
          message: `Your enrollment request for "${transaction.courses?.title}" was not approved. Please contact support if you believe this is an error.`,
          type: "error",
        });
      }

      toast({
        title: "Rejected",
        description: "Enrollment request has been rejected.",
      });

      setRejectDialog({ open: false, id: null });
      fetchTransactions();
    } catch (error: any) {
      console.error("Error rejecting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject enrollment.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.profile?.email?.toLowerCase().includes(searchLower) ||
      tx.trx_id?.toLowerCase().includes(searchLower) ||
      tx.courses?.title?.toLowerCase().includes(searchLower) ||
      `${tx.profile?.first_name} ${tx.profile?.last_name}`.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "success":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Enrollment Requests</h1>
          <p className="text-muted-foreground">
            Review and approve student enrollment requests.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No enrollment requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {tx.profile?.first_name} {tx.profile?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.profile?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.courses?.title}
                        </TableCell>
                        <TableCell>৳{tx.amount.toLocaleString("en-BD")}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.trx_id || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(tx.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-right">
                          {tx.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(tx)}
                                disabled={processing === tx.id}
                              >
                                {processing === tx.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectDialog({ open: true, id: tx.id })}
                                disabled={processing === tx.id}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, id: open ? rejectDialog.id : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Enrollment Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the student's enrollment request. They will need to submit a new request with a valid transaction ID.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnrollmentRequests;
