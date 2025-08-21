import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  MessageSquare, 
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  User,
  Package,
  CreditCard,
  RefreshCw,
  Upload,
  Camera
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DisputeFormData {
  orderId: string;
  type: string;
  reason: string;
  description: string;
  evidence: File[];
}

interface TrustSafetyProps {
  orderId?: string;
  sellerId?: string;
  listingId?: string;
}

export default function TrustSafety({ orderId, sellerId, listingId }: TrustSafetyProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("report");
  const [reportType, setReportType] = useState("");
  const [disputeType, setDisputeType] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File[]>([]);
  const [returnRequested, setReturnRequested] = useState(false);

  // Get user's disputes
  const { data: disputes } = useQuery({
    queryKey: ["/api/user/disputes"],
  });

  // Get order details if provided
  const { data: orderData } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const formData = new FormData();
      Object.keys(reportData).forEach(key => {
        if (key === 'evidence' && reportData[key]) {
          reportData[key].forEach((file: File) => {
            formData.append('evidence', file);
          });
        } else {
          formData.append(key, reportData[key]);
        }
      });
      return await apiRequest("POST", "/api/reports", formData);
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it shortly.",
      });
      resetForm();
    },
  });

  // Submit dispute mutation
  const submitDisputeMutation = useMutation({
    mutationFn: async (disputeData: any) => {
      const formData = new FormData();
      Object.keys(disputeData).forEach(key => {
        if (key === 'evidence' && disputeData[key]) {
          disputeData[key].forEach((file: File) => {
            formData.append('evidence', file);
          });
        } else {
          formData.append(key, disputeData[key]);
        }
      });
      return await apiRequest("POST", "/api/disputes", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/disputes"] });
      toast({
        title: "Dispute opened",
        description: "Your dispute has been submitted. We'll review it within 48 hours.",
      });
      resetForm();
    },
  });

  // Request return mutation
  const requestReturnMutation = useMutation({
    mutationFn: async (returnData: any) => {
      return await apiRequest("POST", `/api/orders/${orderId}/return`, returnData);
    },
    onSuccess: () => {
      toast({
        title: "Return requested",
        description: "Your return request has been submitted to the seller.",
      });
      setReturnRequested(true);
    },
  });

  const resetForm = () => {
    setReportType("");
    setDisputeType("");
    setReason("");
    setDescription("");
    setEvidence([]);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 5); // Max 5 files
      setEvidence(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = () => {
    if (!reportType || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitReportMutation.mutate({
      type: reportType,
      reason,
      description,
      evidence,
      sellerId,
      listingId,
      orderId,
    });
  };

  const handleSubmitDispute = () => {
    if (!disputeType || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitDisputeMutation.mutate({
      orderId,
      type: disputeType,
      reason,
      description,
      evidence,
    });
  };

  const handleRequestReturn = () => {
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please explain why you want to return this item",
        variant: "destructive",
      });
      return;
    }

    requestReturnMutation.mutate({
      reason,
      description,
      evidence,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="mr-2 text-red-500" size={24} />
            Trust & Safety Center
          </CardTitle>
          <p className="text-zinc-400">
            Report issues, open disputes, or request returns for your orders
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
          <TabsTrigger value="report" className="text-zinc-300 data-[state=active]:text-white">
            <Flag className="mr-2" size={16} />
            Report Issue
          </TabsTrigger>
          <TabsTrigger value="dispute" className="text-zinc-300 data-[state=active]:text-white" disabled={!orderId}>
            <AlertTriangle className="mr-2" size={16} />
            Open Dispute
          </TabsTrigger>
          <TabsTrigger value="return" className="text-zinc-300 data-[state=active]:text-white" disabled={!orderId}>
            <RefreshCw className="mr-2" size={16} />
            Request Return
          </TabsTrigger>
          <TabsTrigger value="status" className="text-zinc-300 data-[state=active]:text-white">
            <Clock className="mr-2" size={16} />
            My Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Report an Issue</CardTitle>
              <p className="text-zinc-400">
                Help us maintain a safe marketplace by reporting problematic listings, sellers, or behavior
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Report Type *
                  </label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counterfeit">Counterfeit Item</SelectItem>
                      <SelectItem value="prohibited">Prohibited Item</SelectItem>
                      <SelectItem value="misleading">Misleading Description</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="fraud">Fraudulent Activity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <Input
                    placeholder="Specify category if 'Other'"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Please provide detailed information about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Evidence (Optional)
                </label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="evidence-upload"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-zinc-400 mb-4" size={48} />
                    <p className="text-zinc-400">
                      Click to upload photos or documents<br />
                      <span className="text-sm">Max 5 files, 10MB each</span>
                    </p>
                  </label>
                </div>

                {evidence.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {evidence.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-zinc-400" size={20} />
                          <span className="text-white text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidence(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmitReport}
                disabled={submitReportMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {submitReportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispute" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Open a Dispute</CardTitle>
              <p className="text-zinc-400">
                If you have an issue with your order, we're here to help resolve it
              </p>
              {orderData && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-white font-medium">Order #{orderData.id?.slice(0, 8)}</h4>
                  <p className="text-zinc-400 text-sm">
                    Ordered on {new Date(orderData.createdAt).toLocaleDateString()} • ${orderData.total}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dispute Type *
                </label>
                <Select value={disputeType} onValueChange={setDisputeType}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select dispute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_received">Item Not Received</SelectItem>
                    <SelectItem value="not_described">Item Not as Described</SelectItem>
                    <SelectItem value="damaged">Item Damaged</SelectItem>
                    <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="unauthorized">Unauthorized Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  What happened? *
                </label>
                <Textarea
                  placeholder="Please describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Evidence
                </label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="dispute-evidence"
                  />
                  <label htmlFor="dispute-evidence" className="cursor-pointer">
                    <Camera className="mx-auto text-zinc-400 mb-4" size={48} />
                    <p className="text-zinc-400">
                      Upload photos of the issue<br />
                      <span className="text-sm">Photos help us resolve disputes faster</span>
                    </p>
                  </label>
                </div>

                {evidence.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {evidence.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidence(index)}
                          className="absolute top-1 right-1 bg-black/70 text-white hover:bg-black/90"
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-yellow-500 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-yellow-400 font-medium">Before opening a dispute</h4>
                    <p className="text-zinc-300 text-sm mt-1">
                      Consider contacting the seller first. Many issues can be resolved quickly through direct communication.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitDispute}
                disabled={submitDisputeMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {submitDisputeMutation.isPending ? "Opening Dispute..." : "Open Dispute"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Request Return</CardTitle>
              <p className="text-zinc-400">
                Request a return for items that don't meet your expectations
              </p>
              {orderData && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-white font-medium">Order #{orderData.id?.slice(0, 8)}</h4>
                  <p className="text-zinc-400 text-sm">
                    Delivered on {orderData.deliveredAt ? new Date(orderData.deliveredAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Reason for Return *
                </label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select return reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Defective/Damaged</SelectItem>
                    <SelectItem value="not_described">Not as Described</SelectItem>
                    <SelectItem value="wrong_size">Wrong Size</SelectItem>
                    <SelectItem value="changed_mind">Changed Mind</SelectItem>
                    <SelectItem value="quality">Quality Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Additional Details
                </label>
                <Textarea
                  placeholder="Please explain why you want to return this item..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
              </div>

              {!returnRequested ? (
                <Button
                  onClick={handleRequestReturn}
                  disabled={requestReturnMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {requestReturnMutation.isPending ? "Submitting..." : "Request Return"}
                </Button>
              ) : (
                <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                  <h3 className="text-green-400 font-medium mb-2">Return Requested</h3>
                  <p className="text-zinc-300 text-sm">
                    Your return request has been sent to the seller. They'll respond within 2 business days.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">My Cases</CardTitle>
              <p className="text-zinc-400">
                Track the status of your reports, disputes, and return requests
              </p>
            </CardHeader>
            <CardContent>
              {disputes?.length > 0 ? (
                <div className="space-y-4">
                  {disputes.map((dispute: any) => (
                    <div key={dispute.id} className="p-4 border border-zinc-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-medium">
                            {dispute.type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            Case #{dispute.id.slice(0, 8)} • {new Date(dispute.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          dispute.status === 'open' ? 'destructive' :
                          dispute.status === 'in_progress' ? 'default' :
                          dispute.status === 'resolved' ? 'outline' : 'secondary'
                        }>
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-zinc-300 mb-4">{dispute.reason}</p>
                      
                      {dispute.resolution && (
                        <div className="p-3 bg-zinc-800 rounded-lg">
                          <h5 className="text-white font-medium mb-2">Resolution</h5>
                          <p className="text-zinc-300 text-sm">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield size={64} className="text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No cases yet</h3>
                  <p className="text-zinc-400">Your reports and disputes will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}