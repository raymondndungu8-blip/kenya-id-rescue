import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye,
  MapPin,
  Calendar,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sanitizeError } from "@/lib/errorHandler";

interface FoundID {
  id: string;
  id_type: string;
  name_on_id: string | null;
  id_number: string | null;
  location_found: string;
  date_found: string;
  status: string;
  created_at: string;
}

interface VerificationRequest {
  id: string;
  found_id_ref: string;
  requester_id: string;
  verification_answer: string | null;
  status: string | null;
  created_at: string | null;
  expires_at: string | null;
  reporter_response: string | null;
  found_id?: FoundID;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [myReports, setMyReports] = useState<FoundID[]>([]);
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch user's found ID reports
      const { data: reports, error: reportsError } = await supabase
        .from("found_ids")
        .select("*")
        .eq("reporter_id", user?.id)
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;
      setMyReports(reports || []);

      // Fetch pending verification requests for user's reports
      const { data: requests, error: requestsError } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      // Filter to only show requests for user's reports and attach found_id info
      const enrichedRequests = (requests || []).map(req => {
        const foundId = reports?.find(r => r.id === req.found_id_ref);
        return { ...req, found_id: foundId };
      }).filter(req => req.found_id);

      setPendingRequests(enrichedRequests);
    } catch (error) {
      toast.error(sanitizeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (request: VerificationRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setDialogAction(action);
    setResponseMessage("");
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setDialogAction(null);
    setResponseMessage("");
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !dialogAction) return;

    setIsProcessing(true);
    try {
      const newStatus = dialogAction === "approve" ? "approved" : "rejected";
      
      const { error } = await supabase
        .from("verification_requests")
        .update({
          status: newStatus,
          reporter_response: responseMessage || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast.success(
        dialogAction === "approve"
          ? "Request approved! The requester can now view the ID details."
          : "Request rejected."
      );

      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(sanitizeError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              My Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your found ID reports and verification requests
            </p>
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="requests" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Requests
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="w-4 h-4" />
                My Reports
              </TabsTrigger>
            </TabsList>

            {/* Verification Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">
                      You don't have any verification requests to review at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Verification Request
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span>For: {request.found_id?.id_type}</span>
                              {request.found_id?.name_on_id && (
                                <span>• {request.found_id.name_on_id}</span>
                              )}
                            </CardDescription>
                          </div>
                          {getStatusBadge(request.status || "pending")}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* ID Information */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">Found ID Details</h4>
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{request.found_id?.location_found}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Found on {new Date(request.found_id?.date_found || "").toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Verification Answer */}
                        {request.verification_answer && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Requester's Verification Answer
                            </h4>
                            <p className="text-sm">{request.verification_answer}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleOpenDialog(request, "approve")}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleOpenDialog(request, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : myReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Reports Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't reported any found IDs yet.
                    </p>
                    <Button variant="hero" onClick={() => navigate("/report-found")}>
                      Report a Found ID
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{report.id_type}</CardTitle>
                            <CardDescription>
                              {report.name_on_id || "Name not visible"}
                            </CardDescription>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{report.location_found}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Found on {new Date(report.date_found).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve"
                ? "The requester will be able to see the full ID details and your contact information."
                : "The requester will be notified that their request was rejected."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Add a message (optional)
              </label>
              <Textarea
                placeholder={
                  dialogAction === "approve"
                    ? "e.g., Please contact me to arrange pickup..."
                    : "e.g., The verification details don't match..."
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessRequest}
              disabled={isProcessing}
              className={dialogAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={dialogAction === "reject" ? "destructive" : "default"}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : dialogAction === "approve" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {dialogAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
