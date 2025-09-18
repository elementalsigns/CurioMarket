import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { Search, UserX, UserCheck, Eye, MoreHorizontal, Users, Mail, Calendar, Shield, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'visitor' | 'buyer' | 'seller' | 'admin';
  accountStatus: string;
  stripeCustomerId?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  verificationLevel: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    shopName: string;
    isActive: boolean;
    verificationStatus: string;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const roleColors = {
  visitor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  buyer: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  seller: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  suspended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  banned: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
};

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "visitor", label: "Visitors" },
  { value: "buyer", label: "Buyers" },
  { value: "seller", label: "Sellers" },
  { value: "admin", label: "Admins" }
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" }
];

export function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const limit = 10;

  // Fetch users with search and filtering
  const { data: usersData, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', { 
      search, 
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page, 
      limit 
    }],
    staleTime: 30000, // 30 seconds
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/ban`, { reason });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Banned",
        description: "The user has been successfully banned.",
      });
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Ban Failed",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/unban`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Unbanned",
        description: "The user has been successfully unbanned.",
      });
      setIsUnbanDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Unban Failed",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`, {
        confirmDeletion: 'I understand this action is irreversible'
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Account Deleted",
        description: data.message || "The user account has been permanently deleted.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      setDeleteConfirmation("");
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete user account",
        variant: "destructive",
      });
    },
  });

  const handleBanUser = () => {
    if (selectedUser && banReason.trim()) {
      banUserMutation.mutate({ userId: selectedUser.id, reason: banReason.trim() });
    }
  };

  const handleUnbanUser = () => {
    if (selectedUser) {
      unbanUserMutation.mutate(selectedUser.id);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser && deleteConfirmation === "I understand this action is irreversible") {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Safety checks for deletion
  const canDeleteUser = (user: User) => {
    // Prevent self-deletion
    if (currentUser && typeof currentUser === 'object' && 'id' in currentUser && user.id === (currentUser as any).id) {
      return false;
    }
    // Prevent deleting other admin users
    if (user.role === 'admin') {
      return false;
    }
    return true;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || 'Unknown User';
  };

  const getVerificationBadges = (user: User) => {
    const badges = [];
    if (user.emailVerified) badges.push('Email');
    if (user.phoneVerified) badges.push('Phone');
    if (user.identityVerified) badges.push('ID');
    return badges;
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading users</p>
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
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-role-filter">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            {usersData ? `${usersData.total} total users` : 'Loading users...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{getUserDisplayName(user)}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.seller && (
                            <div className="text-xs text-muted-foreground">
                              Shop: {user.seller.shopName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]} data-testid={`badge-role-${user.role}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[user.accountStatus as keyof typeof statusColors] || statusColors.active} 
                          data-testid={`badge-status-${user.accountStatus}`}
                        >
                          {user.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getVerificationBadges(user).map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                          {user.verificationLevel > 0 && (
                            <Badge variant="outline" className="text-xs">
                              L{user.verificationLevel}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </div>
                          {user.lastLoginAt && (
                            <div className="text-xs text-muted-foreground">
                              Last login: {formatDate(user.lastLoginAt)}
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
                              setSelectedUser(user);
                              setIsDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-${user.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.accountStatus === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsBanDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              data-testid={`button-ban-${user.id}`}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : user.accountStatus === 'banned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUnbanDialogOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              data-testid={`button-unban-${user.id}`}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {canDeleteUser(user) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-700 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-950"
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usersData?.users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {usersData && usersData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {usersData.page} of {usersData.totalPages} ({usersData.total} total users)
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
                      disabled={page >= usersData.totalPages}
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

      {/* Ban User Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent data-testid="dialog-ban-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Ban User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban "{selectedUser?.email}"? This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="ban-reason" className="text-sm font-medium">
              Reason for ban (required)
            </Label>
            <Textarea
              id="ban-reason"
              placeholder="Please provide a reason for banning this user..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="mt-2"
              data-testid="textarea-ban-reason"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-ban">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              disabled={banUserMutation.isPending || !banReason.trim()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-ban"
            >
              {banUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban User Dialog */}
      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent data-testid="dialog-unban-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              Unban User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban "{selectedUser?.email}"? This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-unban">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnbanUser}
              disabled={unbanUserMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-unban"
            >
              {unbanUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-user-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{getUserDisplayName(selectedUser)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Badge className={roleColors[selectedUser.role]}>{selectedUser.role}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Status</label>
                  <Badge className={statusColors[selectedUser.accountStatus as keyof typeof statusColors] || statusColors.active}>
                    {selectedUser.accountStatus}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Verification Level</label>
                  <p className="text-sm text-muted-foreground">Level {selectedUser.verificationLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Stripe Customer</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.stripeCustomerId ? `${selectedUser.stripeCustomerId.substring(0, 20)}...` : 'None'}
                  </p>
                </div>
              </div>
              
              {selectedUser.seller && (
                <div>
                  <label className="text-sm font-medium">Seller Information</label>
                  <div className="mt-2 p-3 bg-muted rounded-md space-y-2">
                    <p className="text-sm"><strong>Shop Name:</strong> {selectedUser.seller.shopName}</p>
                    <p className="text-sm"><strong>Status:</strong> {selectedUser.seller.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm"><strong>Verification:</strong> {selectedUser.seller.verificationStatus}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Verification Status</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={selectedUser.emailVerified ? "default" : "outline"}>
                    {selectedUser.emailVerified ? "✓" : "✗"} Email
                  </Badge>
                  <Badge variant={selectedUser.phoneVerified ? "default" : "outline"}>
                    {selectedUser.phoneVerified ? "✓" : "✗"} Phone
                  </Badge>
                  <Badge variant={selectedUser.identityVerified ? "default" : "outline"}>
                    {selectedUser.identityVerified ? "✓" : "✗"} Identity
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Member Since</label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="font-medium">Last Updated</label>
                  <p>{formatDate(selectedUser.updatedAt)}</p>
                </div>
                {selectedUser.lastLoginAt && (
                  <div>
                    <label className="font-medium">Last Login</label>
                    <p>{formatDate(selectedUser.lastLoginAt)}</p>
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

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-2xl" data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="text-red-700 dark:text-red-400 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">⚠️ DANGER: Permanent Account Deletion</span>
                </div>
                <p className="text-sm">
                  You are about to permanently delete the account for <strong>"{selectedUser?.email}"</strong>.
                  This action cannot be undone and will result in complete data loss.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">The following data will be permanently deleted:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• User profile and account information</li>
                  <li>• All orders (both as buyer and seller)</li>
                  <li>• All product listings and shop data</li>
                  <li>• Messages and conversation history</li>
                  <li>• Reviews and ratings</li>
                  <li>• Favorites and wishlists</li>
                  <li>• Analytics and activity data</li>
                  <li>• Payment and transaction history</li>
                  <li>• Verification records and documents</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4 bg-red-50 dark:bg-red-950 p-3 rounded">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  🔒 This action is IRREVERSIBLE. Once deleted, the user's data cannot be recovered.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium text-red-700 dark:text-red-400">
              To confirm deletion, type the exact phrase below:
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded border font-mono text-xs">
                I understand this action is irreversible
              </div>
            </Label>
            <Input
              id="delete-confirmation"
              placeholder="Type the exact phrase above to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="mt-2 border-red-300 focus:border-red-500 focus:ring-red-500"
              data-testid="input-delete-confirmation"
            />
            {deleteConfirmation && deleteConfirmation !== "I understand this action is irreversible" && (
              <p className="text-xs text-red-500 mt-1" data-testid="text-confirmation-mismatch">
                Please type exactly "I understand this action is irreversible" to continue
              </p>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmation("");
                setSelectedUser(null);
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending || deleteConfirmation !== "I understand this action is irreversible"}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteUserMutation.isPending ? "Deleting..." : "Delete Account Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}