import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Scale, Eye, CreditCard, MessageSquare, Calendar, DollarSign, User, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface OrderDispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  description?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  refundAmount?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  order?: {
    id: string;
    total: string;
    status: string;
    createdAt: string;
  };
  buyer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  seller?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    shopName?: string;
  };
}

interface DisputesResponse {
  disputes: OrderDispute[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors = {
  open: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  investigating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  resolved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
};

const statusOptions = [
  { value: "all", label: "All Disputes" },
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];

const resolutionOptions = [
  { value: "buyer_favor", label: "Rule in Buyer's Favor", description: "Full refund to buyer" },
  { value: "seller_favor", label: "Rule in Seller's Favor", description: "No refund, order stands" },
  { value: "partial_refund", label: "Partial Resolution", description: "Partial refund based on evidence" },
  { value: "mediated", label: "Mediated Settlement", description: "Both parties agree to resolution" }
];

export function OrderDisputes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<OrderDispute | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const { toast } = useToast();
  
  const limit = 10;

  // Fetch disputes with search and filtering
  const { data: disputesData, isLoading, error } = useQuery<DisputesResponse>({
    queryKey: ['/api/admin/disputes', { 
      search, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page, 
      limit 
    }],
    staleTime: 30000, // 30 seconds
  });

  // Resolve dispute mutation
  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, resolution, notes }: { disputeId: string; resolution: string; notes?: string }) => {
      const response = await apiRequest('POST', `/api/admin/disputes/${disputeId}/resolve`, { resolution, notes });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
      toast({
        title: "Dispute Resolved",
        description: "The dispute has been successfully resolved.",
      });
      setIsResolveDialogOpen(false);
      setSelectedDispute(null);
      setResolution("");
      setResolutionNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Resolution Failed",
        description: error.message || "Failed to resolve dispute",
        variant: "destructive",
      });
    },
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async ({ orderId, amount, reason }: { orderId: string; amount: string; reason?: string }) => {
      const response = await apiRequest('POST', `/api/admin/orders/${orderId}/refund`, { amount, reason });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
      toast({
        title: "Refund Processed",
        description: `Refund of $${refundAmount} has been successfully processed.`,
      });
      setIsRefundDialogOpen(false);
      setSelectedDispute(null);
      setRefundAmount("");
      setResolutionNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    },
  });

  const handleResolveDispute = () => {
    if (selectedDispute && resolution) {
      resolveDisputeMutation.mutate({ 
        disputeId: selectedDispute.id, 
        resolution, 
        notes: resolutionNotes.trim() || undefined 
      });
    }
  };

  const handleProcessRefund = () => {
    if (selectedDispute && refundAmount) {
      processRefundMutation.mutate({ 
        orderId: selectedDispute.orderId, 
        amount: refundAmount,
        reason: resolutionNotes.trim() || undefined 
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getBuyerDisplayName = (dispute: OrderDispute) => {
    if (dispute.buyer?.firstName && dispute.buyer?.lastName) {
      return `${dispute.buyer.firstName} ${dispute.buyer.lastName}`;
    }
    return dispute.buyer?.email || 'Unknown Buyer';
  };

  const getSellerDisplayName = (dispute: OrderDispute) => {
    if (dispute.seller?.firstName && dispute.seller?.lastName) {
      return `${dispute.seller.firstName} ${dispute.seller.lastName}`;
    }
    return dispute.seller?.shopName || dispute.seller?.email || 'Unknown Seller';
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading disputes</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search disputes by order ID, buyer, seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-disputes"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Order Disputes & Refunds
          </CardTitle>
          <CardDescription>
            {disputesData ? `${disputesData.total} total disputes` : 'Loading disputes...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading disputes...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order & Parties</TableHead>
                    <TableHead>Dispute Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputesData?.disputes.map((dispute) => (
                    <TableRow key={dispute.id} data-testid={`row-dispute-${dispute.id}`}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium text-sm">
                            Order #{dispute.orderId.slice(-8).toUpperCase()}
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Buyer: {getBuyerDisplayName(dispute)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Seller: {getSellerDisplayName(dispute)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{dispute.reason}</p>
                          {dispute.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {dispute.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign className="h-3 w-3" />
                            {dispute.order ? formatCurrency(dispute.order.total) : 'N/A'}
                          </div>
                          {dispute.refundAmount && (
                            <div className="text-xs text-green-600">
                              Refund: {formatCurrency(dispute.refundAmount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[dispute.status]} data-testid={`badge-status-${dispute.status}`}>
                          {dispute.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(dispute.createdAt)}
                          </div>
                          {dispute.resolvedAt && (
                            <div className="text-xs text-muted-foreground">
                              Resolved: {formatDate(dispute.resolvedAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setIsDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-${dispute.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setIsResolveDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                data-testid={`button-resolve-${dispute.id}`}
                              >
                                <Scale className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setRefundAmount(dispute.order?.total || "0");
                                  setIsRefundDialogOpen(true);
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                data-testid={`button-refund-${dispute.id}`}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {disputesData?.disputes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No disputes found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {disputesData && disputesData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {disputesData.page} of {disputesData.totalPages} ({disputesData.total} total disputes)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= disputesData.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dispute Dialog */}
      <AlertDialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <AlertDialogContent data-testid="dialog-resolve-confirmation" className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              Resolve Dispute
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review and resolve the dispute for Order #{selectedDispute?.orderId.slice(-8).toUpperCase()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedDispute && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="space-y-2">
                  <div><strong>Reason:</strong> {selectedDispute.reason}</div>
                  <div><strong>Order Total:</strong> {selectedDispute.order ? formatCurrency(selectedDispute.order.total) : 'N/A'}</div>
                  <div><strong>Buyer:</strong> {getBuyerDisplayName(selectedDispute)}</div>
                  <div><strong>Seller:</strong> {getSellerDisplayName(selectedDispute)}</div>
                  {selectedDispute.description && (
                    <div><strong>Details:</strong> {selectedDispute.description}</div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="resolution-type" className="text-sm font-medium">
                  Resolution (required)
                </Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="mt-2" data-testid="select-resolution-type">
                    <SelectValue placeholder="Select resolution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="resolution-notes" className="text-sm font-medium">
                  Resolution Notes
                </Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Explain your resolution decision and any relevant details..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mt-2"
                  data-testid="textarea-resolution-notes"
                />
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-resolve">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveDispute}
              disabled={resolveDisputeMutation.isPending || !resolution}
              data-testid="button-confirm-resolve"
            >
              {resolveDisputeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolve Dispute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Process Refund Dialog */}
      <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <AlertDialogContent data-testid="dialog-refund-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Process Refund
            </AlertDialogTitle>
            <AlertDialogDescription>
              Process a refund for Order #{selectedDispute?.orderId.slice(-8).toUpperCase()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedDispute && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <div><strong>Order Total:</strong> {selectedDispute.order ? formatCurrency(selectedDispute.order.total) : 'N/A'}</div>
                <div><strong>Buyer:</strong> {getBuyerDisplayName(selectedDispute)}</div>
              </div>
              
              <div>
                <Label htmlFor="refund-amount" className="text-sm font-medium">
                  Refund Amount ($)
                </Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedDispute.order?.total || "0"}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="mt-2"
                  data-testid="input-refund-amount"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum refund: {selectedDispute.order ? formatCurrency(selectedDispute.order.total) : 'N/A'}
                </p>
              </div>
              
              <div>
                <Label htmlFor="refund-reason" className="text-sm font-medium">
                  Refund Reason
                </Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Explain the reason for this refund..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mt-2"
                  data-testid="textarea-refund-reason"
                />
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-refund">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessRefund}
              disabled={processRefundMutation.isPending || !refundAmount || parseFloat(refundAmount) <= 0}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-refund"
            >
              {processRefundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispute Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-dispute-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dispute Details
            </DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Order ID</label>
                  <p className="text-sm text-muted-foreground">#{selectedDispute.orderId.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedDispute.status]}>
                    {selectedDispute.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Total</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedDispute.order ? formatCurrency(selectedDispute.order.total) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Status</label>
                  <p className="text-sm text-muted-foreground">{selectedDispute.order?.status || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Dispute Reason</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedDispute.reason}</p>
              </div>
              
              {selectedDispute.description && (
                <div>
                  <label className="text-sm font-medium">Additional Details</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDispute.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Buyer</label>
                  <div className="text-sm text-muted-foreground">
                    <p>{getBuyerDisplayName(selectedDispute)}</p>
                    <p>{selectedDispute.buyer?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Seller</label>
                  <div className="text-sm text-muted-foreground">
                    <p>{getSellerDisplayName(selectedDispute)}</p>
                    <p>{selectedDispute.seller?.email}</p>
                  </div>
                </div>
              </div>
              
              {selectedDispute.resolution && (
                <div>
                  <label className="text-sm font-medium">Resolution</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDispute.resolution}</p>
                </div>
              )}
              
              {selectedDispute.refundAmount && (
                <div>
                  <label className="text-sm font-medium">Refund Amount</label>
                  <p className="text-sm text-green-600 font-medium">
                    {formatCurrency(selectedDispute.refundAmount)}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Dispute Created</label>
                  <p>{formatDate(selectedDispute.createdAt)}</p>
                </div>
                {selectedDispute.resolvedAt && (
                  <div>
                    <label className="font-medium">Resolved</label>
                    <p>{formatDate(selectedDispute.resolvedAt)}</p>
                  </div>
                )}
                {selectedDispute.order?.createdAt && (
                  <div>
                    <label className="font-medium">Order Created</label>
                    <p>{formatDate(selectedDispute.order.createdAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}