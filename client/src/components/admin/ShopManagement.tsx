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
import { Search, Store, ShoppingBag, Eye, MoreHorizontal, Users, Mail, Calendar, ShieldCheck, AlertTriangle, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Shop {
  id: string;
  userId: string;
  shopName: string;
  bio?: string;
  location?: string;
  isActive: boolean;
  businessVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    accountStatus: string;
  };
  _count?: {
    listings: number;
    orders: number;
  };
}

interface ShopsResponse {
  shops: Shop[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  inactive: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
};

const verificationColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
};

const statusOptions = [
  { value: "all", label: "All Shops" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

const verificationOptions = [
  { value: "all", label: "All Verification" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

export function ShopManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const { toast } = useToast();
  
  const limit = 10;

  // Fetch shops with search and filtering
  const { data: shopsData, isLoading, error } = useQuery<ShopsResponse>({
    queryKey: ['/api/admin/shops', { 
      search, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      verification: verificationFilter !== 'all' ? verificationFilter : undefined,
      page, 
      limit 
    }],
    staleTime: 30000, // 30 seconds
  });

  // Suspend shop mutation
  const suspendShopMutation = useMutation({
    mutationFn: async ({ shopId, reason }: { shopId: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/shops/${shopId}/suspend`, { reason });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shops'] });
      toast({
        title: "Shop Suspended",
        description: "The shop has been successfully suspended.",
      });
      setIsSuspendDialogOpen(false);
      setSelectedShop(null);
      setActionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend shop",
        variant: "destructive",
      });
    },
  });

  // Reactivate shop mutation
  const reactivateShopMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const response = await apiRequest('POST', `/api/admin/shops/${shopId}/reactivate`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shops'] });
      toast({
        title: "Shop Reactivated",
        description: "The shop has been successfully reactivated.",
      });
      setIsReactivateDialogOpen(false);
      setSelectedShop(null);
    },
    onError: (error: any) => {
      toast({
        title: "Reactivation Failed",
        description: error.message || "Failed to reactivate shop",
        variant: "destructive",
      });
    },
  });

  const handleSuspendShop = () => {
    if (selectedShop && actionReason.trim()) {
      suspendShopMutation.mutate({ shopId: selectedShop.id, reason: actionReason.trim() });
    }
  };

  const handleReactivateShop = () => {
    if (selectedShop) {
      reactivateShopMutation.mutate(selectedShop.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getOwnerDisplayName = (shop: Shop) => {
    if (shop.user?.firstName && shop.user?.lastName) {
      return `${shop.user.firstName} ${shop.user.lastName}`;
    }
    return shop.user?.email || 'Unknown Owner';
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 70) return { label: 'High Risk', className: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' };
    if (riskScore >= 40) return { label: 'Medium Risk', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' };
    return { label: 'Low Risk', className: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' };
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading shops</p>
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
            placeholder="Search shops by name, owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-shops"
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
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-verification-filter">
            <SelectValue placeholder="Filter by verification" />
          </SelectTrigger>
          <SelectContent>
            {verificationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shop Management
          </CardTitle>
          <CardDescription>
            {shopsData ? `${shopsData.total} total shops` : 'Loading shops...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading shops...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopsData?.shops.map((shop) => (
                    <TableRow key={shop.id} data-testid={`row-shop-${shop.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{shop.shopName}</p>
                          {shop.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {shop.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className={verificationColors[shop.verificationStatus]} data-testid={`badge-verification-${shop.verificationStatus}`}>
                              {shop.verificationStatus}
                            </Badge>
                            {shop.businessVerified && (
                              <Badge variant="outline" className="text-xs">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{getOwnerDisplayName(shop)}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {shop.user?.email}
                          </div>
                          {shop.user?.accountStatus && (
                            <Badge 
                              variant={shop.user.accountStatus === 'active' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {shop.user.accountStatus}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[shop.isActive ? 'active' : 'inactive']} 
                          data-testid={`badge-status-${shop.isActive ? 'active' : 'inactive'}`}
                        >
                          {shop.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>{shop._count?.listings || 0} listings</div>
                          <div className="text-xs text-muted-foreground">
                            {shop._count?.orders || 0} orders
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadge(shop.riskScore).className}>
                          {getRiskBadge(shop.riskScore).label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Score: {shop.riskScore}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(shop.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedShop(shop);
                              setIsDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-${shop.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {shop.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setIsSuspendDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              data-testid={`button-suspend-${shop.id}`}
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setIsReactivateDialogOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              data-testid={`button-reactivate-${shop.id}`}
                            >
                              <Store className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {shopsData?.shops.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No shops found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {shopsData && shopsData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {shopsData.page} of {shopsData.totalPages} ({shopsData.total} total shops)
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
                      disabled={page >= shopsData.totalPages}
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

      {/* Suspend Shop Dialog */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent data-testid="dialog-suspend-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Suspend Shop
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{selectedShop?.shopName}"? This will hide all their listings and prevent new sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="suspend-reason" className="text-sm font-medium">
              Reason for suspension (required)
            </Label>
            <Textarea
              id="suspend-reason"
              placeholder="Please provide a reason for suspending this shop..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="mt-2"
              data-testid="textarea-suspend-reason"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-suspend">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendShop}
              disabled={suspendShopMutation.isPending || !actionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-suspend"
            >
              {suspendShopMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend Shop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Shop Dialog */}
      <AlertDialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <AlertDialogContent data-testid="dialog-reactivate-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-green-500" />
              Reactivate Shop
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate "{selectedShop?.shopName}"? This will make their listings visible again and allow new sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reactivate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivateShop}
              disabled={reactivateShopMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-reactivate"
            >
              {reactivateShopMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reactivate Shop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shop Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-shop-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Shop Details
            </DialogTitle>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Shop Name</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.shopName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedShop.isActive ? 'active' : 'inactive']}>
                    {selectedShop.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-sm text-muted-foreground">{getOwnerDisplayName(selectedShop)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Owner Email</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Verification Status</label>
                  <Badge className={verificationColors[selectedShop.verificationStatus]}>
                    {selectedShop.verificationStatus}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskBadge(selectedShop.riskScore).className}>
                      {getRiskBadge(selectedShop.riskScore).label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">({selectedShop.riskScore})</span>
                  </div>
                </div>
                {selectedShop.location && (
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-muted-foreground">{selectedShop.location}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Performance</label>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedShop._count?.listings || 0} listings</p>
                    <p>{selectedShop._count?.orders || 0} orders</p>
                  </div>
                </div>
              </div>
              
              {selectedShop.bio && (
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedShop.bio}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Verification Status</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={selectedShop.businessVerified ? "default" : "outline"}>
                    {selectedShop.businessVerified ? "✓" : "✗"} Business Verified
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Created</label>
                  <p>{formatDate(selectedShop.createdAt)}</p>
                </div>
                <div>
                  <label className="font-medium">Last Updated</label>
                  <p>{formatDate(selectedShop.updatedAt)}</p>
                </div>
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