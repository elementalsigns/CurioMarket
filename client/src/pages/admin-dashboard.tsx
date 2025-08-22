import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  RefreshCw, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalListings: number;
  totalOrders: number;
  pendingVerifications: number;
  disputedOrders: number;
  flaggedContent: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [adminAction, setAdminAction] = useState("");

  // Fetch admin statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  }) as { data: AdminStats | undefined };

  // Fetch verification queue
  const { data: verificationQueue } = useQuery({
    queryKey: ['/api/admin/verification/queue'],
    retry: false,
  });

  // Fetch flagged content
  const { data: flaggedContent } = useQuery({
    queryKey: ['/api/admin/flags'],
    retry: false,
  });

  // Fetch disputed orders
  const { data: disputedOrders } = useQuery({
    queryKey: ['/api/admin/disputes'],
    retry: false,
  });

  // Fetch users for management
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Fetch shops/sellers
  const { data: shops } = useQuery({
    queryKey: ['/api/admin/shops'],
    retry: false,
  });

  // Admin actions mutations
  const banUserMutation = useMutation({
    mutationFn: (data: { userId: string; reason: string }) => 
      apiRequest('POST', `/api/admin/users/${data.userId}/ban`, { reason: data.reason }),
    onSuccess: () => {
      toast({ title: "User banned successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const suspendShopMutation = useMutation({
    mutationFn: (data: { shopId: string; reason: string }) => 
      apiRequest('POST', `/api/admin/shops/${data.shopId}/suspend`, { reason: data.reason }),
    onSuccess: () => {
      toast({ title: "Shop suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shops'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: (data: { orderId: string; amount: number; reason: string }) => 
      apiRequest('POST', `/api/admin/orders/${data.orderId}/refund`, { 
        amount: data.amount, 
        reason: data.reason 
      }),
    onSuccess: () => {
      toast({ title: "Refund processed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: (data: { disputeId: string; resolution: string; notes: string }) => 
      apiRequest('POST', `/api/admin/disputes/${data.disputeId}/resolve`, { 
        resolution: data.resolution, 
        notes: data.notes 
      }),
    onSuccess: () => {
      toast({ title: "Dispute resolved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const moderateContentMutation = useMutation({
    mutationFn: (data: { flagId: string; action: string; notes: string }) => 
      apiRequest('POST', `/api/admin/flags/${data.flagId}/moderate`, { 
        action: data.action, 
        notes: data.notes 
      }),
    onSuccess: () => {
      toast({ title: "Content moderated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flags'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Badge variant="outline" className="text-red-500 border-red-500">
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
              <ShoppingBag className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSellers?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {(stats?.pendingVerifications || 0) + (stats?.disputedOrders || 0) + (stats?.flaggedContent || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${stats?.totalRevenue?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-zinc-900">
            <TabsTrigger value="verification" data-testid="tab-verification">Verifications</TabsTrigger>
            <TabsTrigger value="disputes" data-testid="tab-disputes">Disputes</TabsTrigger>
            <TabsTrigger value="moderation" data-testid="tab-moderation">Moderation</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="shops" data-testid="tab-shops">Shops</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Verification Management */}
          <TabsContent value="verification">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Seller Verification Queue
                </CardTitle>
                <CardDescription>
                  Review and approve seller business verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationQueue?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{item.businessName}</p>
                        <p className="text-sm text-zinc-400">
                          {item.businessType} • Priority: {item.priority}
                        </p>
                        <div className="flex gap-2">
                          {item.riskFactors?.map((risk: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs text-yellow-500">
                              {risk.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                          onClick={() => {
                            apiRequest('POST', `/api/admin/verification/approve/${item.id}`, {
                              notes: "Approved after review"
                            }).then(() => {
                              toast({ title: "Verification approved" });
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/verification/queue'] });
                            });
                          }}
                          data-testid={`button-approve-${item.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                          onClick={() => {
                            const reason = prompt("Reason for rejection:");
                            if (reason) {
                              apiRequest('POST', `/api/admin/verification/reject/${item.id}`, {
                                reason
                              }).then(() => {
                                toast({ title: "Verification rejected" });
                                queryClient.invalidateQueries({ queryKey: ['/api/admin/verification/queue'] });
                              });
                            }
                          }}
                          data-testid={`button-reject-${item.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!verificationQueue?.length && (
                    <div className="text-center py-8 text-zinc-400">
                      No pending verifications
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dispute Resolution */}
          <TabsContent value="disputes">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Order Disputes & Refunds
                </CardTitle>
                <CardDescription>
                  Handle escalated cases, disputes, and refund requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disputedOrders?.map((dispute: any) => (
                    <div key={dispute.id} className="p-4 bg-zinc-800 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{dispute.orderId}</p>
                          <p className="text-sm text-zinc-400">
                            {dispute.buyerName} vs {dispute.sellerName}
                          </p>
                          <p className="text-sm text-zinc-300 mt-1">
                            Reason: {dispute.reason}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-yellow-500">
                          ${dispute.amount}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid={`button-view-dispute-${dispute.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-zinc-700">
                            <DialogHeader>
                              <DialogTitle>Dispute Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Resolution Action</Label>
                                <Select onValueChange={setAdminAction}>
                                  <SelectTrigger className="bg-zinc-800">
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-800">
                                    <SelectItem value="refund_full">Full Refund</SelectItem>
                                    <SelectItem value="refund_partial">Partial Refund</SelectItem>
                                    <SelectItem value="favor_seller">Favor Seller</SelectItem>
                                    <SelectItem value="mediation">Require Mediation</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {adminAction?.includes('refund') && (
                                <div>
                                  <Label>Refund Amount</Label>
                                  <Input
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-zinc-800"
                                    data-testid="input-refund-amount"
                                  />
                                </div>
                              )}
                              
                              <div>
                                <Label>Admin Notes</Label>
                                <Textarea
                                  placeholder="Add resolution notes..."
                                  className="bg-zinc-800"
                                  data-testid="textarea-admin-notes"
                                />
                              </div>
                              
                              <Button
                                onClick={() => {
                                  if (adminAction?.includes('refund')) {
                                    processRefundMutation.mutate({
                                      orderId: dispute.orderId,
                                      amount: parseFloat(refundAmount),
                                      reason: adminAction
                                    });
                                  } else {
                                    resolveDisputeMutation.mutate({
                                      disputeId: dispute.id,
                                      resolution: adminAction,
                                      notes: "Resolved by admin"
                                    });
                                  }
                                }}
                                className="w-full bg-red-800 hover:bg-red-700"
                                data-testid="button-resolve-dispute"
                              >
                                Resolve Dispute
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  
                  {!disputedOrders?.length && (
                    <div className="text-center py-8 text-zinc-400">
                      No active disputes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="moderation">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Review flagged listings, messages, and inappropriate content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedContent?.map((flag: any) => (
                    <div key={flag.id} className="p-4 bg-zinc-800 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{flag.contentType}: {flag.contentTitle}</p>
                          <p className="text-sm text-zinc-400">
                            Reported by: {flag.reporterName}
                          </p>
                          <p className="text-sm text-zinc-300 mt-1">
                            Reason: {flag.reason}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={flag.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}
                        >
                          {flag.severity} priority
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                          onClick={() => {
                            moderateContentMutation.mutate({
                              flagId: flag.id,
                              action: 'dismiss',
                              notes: 'No violation found'
                            });
                          }}
                          data-testid={`button-dismiss-flag-${flag.id}`}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black"
                          onClick={() => {
                            moderateContentMutation.mutate({
                              flagId: flag.id,
                              action: 'warn',
                              notes: 'Content warned and user notified'
                            });
                          }}
                          data-testid={`button-warn-flag-${flag.id}`}
                        >
                          Warn User
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                          onClick={() => {
                            moderateContentMutation.mutate({
                              flagId: flag.id,
                              action: 'remove',
                              notes: 'Content removed for policy violation'
                            });
                          }}
                          data-testid={`button-remove-flag-${flag.id}`}
                        >
                          Remove Content
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!flaggedContent?.length && (
                    <div className="text-center py-8 text-zinc-400">
                      No flagged content
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, suspensions, and bans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge 
                              variant="outline" 
                              className={
                                user.accountStatus === 'active' ? 'text-green-500' :
                                user.accountStatus === 'suspended' ? 'text-yellow-500' : 
                                'text-red-500'
                              }
                            >
                              {user.accountStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user.accountStatus === 'active' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                                data-testid={`button-ban-user-${user.id}`}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Ban User
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-700">
                              <DialogHeader>
                                <DialogTitle>Ban User Account</DialogTitle>
                                <DialogDescription>
                                  This will permanently ban the user from the platform.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Reason for Ban</Label>
                                  <Textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Enter reason for banning this user..."
                                    className="bg-zinc-800"
                                    data-testid="textarea-ban-reason"
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    banUserMutation.mutate({
                                      userId: user.id,
                                      reason: banReason
                                    });
                                    setBanReason("");
                                  }}
                                  disabled={!banReason}
                                  className="w-full bg-red-800 hover:bg-red-700"
                                  data-testid="button-confirm-ban"
                                >
                                  Confirm Ban
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Management */}
          <TabsContent value="shops">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Management
                </CardTitle>
                <CardDescription>
                  Manage seller shops, suspensions, and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shops?.map((shop: any) => (
                    <div key={shop.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div>
                        <p className="font-medium">{shop.shopName}</p>
                        <p className="text-sm text-zinc-400">
                          Owner: {shop.ownerName} • {shop.totalListings} listings
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={shop.verificationStatus === 'approved' ? 'text-green-500' : 'text-yellow-500'}
                          >
                            {shop.verificationStatus}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={shop.isActive ? 'text-green-500' : 'text-red-500'}
                          >
                            {shop.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {shop.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                            onClick={() => {
                              const reason = prompt("Reason for suspension:");
                              if (reason) {
                                suspendShopMutation.mutate({
                                  shopId: shop.id,
                                  reason
                                });
                              }
                            }}
                            data-testid={`button-suspend-shop-${shop.id}`}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Suspend Shop
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-zinc-900 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Platform Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{stats?.totalListings || 0}</div>
                      <div className="text-sm text-zinc-400">Total Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{stats?.totalOrders || 0}</div>
                      <div className="text-sm text-zinc-400">Total Orders</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Platform Status</span>
                      <Badge className="bg-green-600">Online</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Processing</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Email Service</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}