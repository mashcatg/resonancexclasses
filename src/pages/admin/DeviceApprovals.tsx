import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { Loader2, Search, Check, X, Monitor, Clock, Shield, XCircle, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface DeviceSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_primary: boolean;
  last_active_at: string;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

const DeviceApprovals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("device_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter === "pending") {
        query = query.eq("is_approved", false).eq("is_active", true);
      } else if (statusFilter === "approved") {
        query = query.eq("is_approved", true).eq("is_active", true);
      } else if (statusFilter === "revoked") {
        query = query.eq("is_active", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const sessionsWithProfiles = data.map((s) => ({
          ...s,
          profile: profileMap.get(s.user_id) || null,
        }));
        setSessions(sessionsWithProfiles);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load device sessions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (session: DeviceSession) => {
    setProcessing(session.id);
    try {
      // Simply approve this device - allow multiple devices per user
      const { error } = await supabase
        .from("device_sessions")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", session.id);

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: session.user_id,
        title: "Device Approved",
        message: `Your device "${session.device_name}" has been approved. You can now access your courses from this device.`,
        type: "success",
      });

      toast({
        title: "Approved!",
        description: "Device has been approved for access.",
      });

      fetchSessions();
    } catch (error: any) {
      console.error("Error approving:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve device.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReapprove = async (session: DeviceSession) => {
    setProcessing(session.id);
    try {
      const { error } = await supabase
        .from("device_sessions")
        .update({
          is_approved: true,
          is_active: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", session.id);

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: session.user_id,
        title: "Device Re-approved",
        message: `Your device "${session.device_name}" has been re-approved. You can now access your courses from this device.`,
        type: "success",
      });

      toast({
        title: "Re-approved!",
        description: "Device access has been restored.",
      });

      fetchSessions();
    } catch (error: any) {
      console.error("Error re-approving:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to re-approve device.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRevoke = async () => {
    if (!revokeDialog.id) return;

    setProcessing(revokeDialog.id);
    try {
      const session = sessions.find((s) => s.id === revokeDialog.id);
      
      const { error } = await supabase
        .from("device_sessions")
        .update({
          is_approved: false,
          is_active: false,
        })
        .eq("id", revokeDialog.id);

      if (error) throw error;

      if (session) {
        await supabase.from("notifications").insert({
          user_id: session.user_id,
          title: "Device Access Revoked",
          message: `Access from "${session.device_name}" has been revoked. Please contact support if you need assistance.`,
          type: "error",
        });
      }

      toast({
        title: "Revoked",
        description: "Device access has been revoked.",
      });

      setRevokeDialog({ open: false, id: null });
      fetchSessions();
    } catch (error: any) {
      console.error("Error revoking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.profile?.email?.toLowerCase().includes(searchLower) ||
      session.device_name?.toLowerCase().includes(searchLower) ||
      `${session.profile?.first_name} ${session.profile?.last_name}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const getStatusBadge = (session: DeviceSession) => {
    if (!session.is_active) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Revoked
        </Badge>
      );
    }
    if (session.is_approved) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Device Approvals</h1>
          <p className="text-muted-foreground text-sm md:text-md">
            Manage student device access. Students can use multiple approved devices.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or device..."
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
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Device Sessions ({filteredSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No device sessions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {session.profile?.first_name} {session.profile?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.profile?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{session.device_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.browser} • {session.os}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(session.last_active_at), {
                              addSuffix: true,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(session)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!session.is_approved && session.is_active ? (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(session)}
                                disabled={processing === session.id}
                              >
                                {processing === session.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            ) : session.is_active ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRevokeDialog({ open: true, id: session.id })}
                                disabled={processing === session.id}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReapprove(session)}
                                disabled={processing === session.id}
                              >
                                {processing === session.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Re-approve
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
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

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog({ open, id: open ? revokeDialog.id : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Device Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the student's access from this device. They will be signed out
              and need to request approval again to use this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeviceApprovals;
