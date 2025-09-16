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
import { Search, Flag, Eye, ThumbsUp, ThumbsDown, XCircle, AlertTriangle, Calendar, User, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface FlaggedContent {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  reporter?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  target?: {
    id: string;
    title?: string;
    content?: string;
    shopName?: string;
    email?: string;
  };
}

interface FlagsResponse {
  flags: FlaggedContent[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  resolved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
};

const targetTypeColors = {
  listing: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  user: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  review: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
  shop: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
};

const statusOptions = [
  { value: "all", label: "All Flags" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" }
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "listing", label: "Listings" },
  { value: "user", label: "Users" },
  { value: "review", label: "Reviews" },
  { value: "shop", label: "Shops" }
];

const moderationActions = [
  { value: "dismiss", label: "Dismiss", icon: XCircle, color: "gray" },
  { value: "warn", label: "Issue Warning", icon: AlertTriangle, color: "yellow" },
  { value: "remove", label: "Remove Content", icon: ThumbsDown, color: "red" },
  { value: "approve", label: "Mark as Resolved", icon: ThumbsUp, color: "green" }
];

export function ContentModeration() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [isModerateDialogOpen, setIsModerateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState("");
  const [moderationNotes, setModerationNotes] = useState("");
  const { toast } = useToast();
  
  const limit = 10;

  // Fetch flagged content with search and filtering
  const { data: flagsData, isLoading, error } = useQuery<FlagsResponse>({
    queryKey: ['/api/admin/flags', { 
      search, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page, 
      limit 
    }],
    staleTime: 30000, // 30 seconds
  });

  // Moderate content mutation
  const moderateContentMutation = useMutation({
    mutationFn: async ({ flagId, action, notes }: { flagId: string; action: string; notes?: string }) => {
      const response = await apiRequest('POST', `/api/admin/flags/${flagId}/moderate`, { action, notes });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flags'] });
      toast({
        title: "Content Moderated",
        description: `Content has been ${moderationAction}d successfully.`,
      });
      setIsModerateDialogOpen(false);
      setSelectedFlag(null);
      setModerationAction("");
      setModerationNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Moderation Failed",
        description: error.message || "Failed to moderate content",
        variant: "destructive",
      });
    },
  });

  const handleModerateContent = () => {
    if (selectedFlag && moderationAction) {
      moderateContentMutation.mutate({ 
        flagId: selectedFlag.id, 
        action: moderationAction, 
        notes: moderationNotes.trim() || undefined 
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

  const getReporterDisplayName = (flag: FlaggedContent) => {
    if (flag.reporter?.firstName && flag.reporter?.lastName) {
      return `${flag.reporter.firstName} ${flag.reporter.lastName}`;
    }
    return flag.reporter?.email || 'Unknown User';
  };

  const getTargetDisplayInfo = (flag: FlaggedContent) => {
    switch (flag.targetType) {
      case 'listing':
        return flag.target?.title || `Listing ${flag.targetId.slice(-8)}`;
      case 'user':
        return flag.target?.email || `User ${flag.targetId.slice(-8)}`;
      case 'shop':
        return flag.target?.shopName || `Shop ${flag.targetId.slice(-8)}`;
      case 'review':
        return `Review ${flag.targetId.slice(-8)}`;
      default:
        return `${flag.targetType} ${flag.targetId.slice(-8)}`;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading flagged content</p>
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
            placeholder="Search flagged content by reason, reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-flags"
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Flagged Content Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>
            {flagsData ? `${flagsData.total} total flags` : 'Loading flagged content...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading flagged content...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flagsData?.flags.map((flag) => (
                    <TableRow key={flag.id} data-testid={`row-flag-${flag.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={targetTypeColors[flag.targetType as keyof typeof targetTypeColors]} data-testid={`badge-type-${flag.targetType}`}>
                              {flag.targetType}
                            </Badge>
                            <p className="font-medium text-sm">{getTargetDisplayInfo(flag)}</p>
                          </div>
                          {flag.target?.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {flag.target.content.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getReporterDisplayName(flag)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{flag.reason}</p>
                          {flag.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {flag.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[flag.status]} data-testid={`badge-status-${flag.status}`}>
                          {flag.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(flag.createdAt)}
                        </div>
                        {flag.resolvedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Resolved: {formatDate(flag.resolvedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFlag(flag);
                              setIsDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-${flag.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {flag.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFlag(flag);
                                setIsModerateDialogOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              data-testid={`button-moderate-${flag.id}`}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {flagsData?.flags.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No flagged content found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {flagsData && flagsData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {flagsData.page} of {flagsData.totalPages} ({flagsData.total} total flags)
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
                      disabled={page >= flagsData.totalPages}
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

      {/* Moderate Content Dialog */}
      <AlertDialog open={isModerateDialogOpen} onOpenChange={setIsModerateDialogOpen}>
        <AlertDialogContent data-testid="dialog-moderate-confirmation" className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-500" />
              Moderate Flagged Content
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review and take action on the flagged content: "{getTargetDisplayInfo(selectedFlag!)}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedFlag && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="space-y-2">
                  <div><strong>Content Type:</strong> {selectedFlag.targetType}</div>
                  <div><strong>Reported By:</strong> {getReporterDisplayName(selectedFlag)}</div>
                  <div><strong>Reason:</strong> {selectedFlag.reason}</div>
                  {selectedFlag.description && (
                    <div><strong>Description:</strong> {selectedFlag.description}</div>
                  )}
                  <div><strong>Reported:</strong> {formatDate(selectedFlag.createdAt)}</div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="moderation-action" className="text-sm font-medium">
                  Action (required)
                </Label>
                <Select value={moderationAction} onValueChange={setModerationAction}>
                  <SelectTrigger className="mt-2" data-testid="select-moderation-action">
                    <SelectValue placeholder="Select moderation action" />
                  </SelectTrigger>
                  <SelectContent>
                    {moderationActions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="moderation-notes" className="text-sm font-medium">
                  Notes (optional)
                </Label>
                <Textarea
                  id="moderation-notes"
                  placeholder="Add any additional notes about this moderation action..."
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  className="mt-2"
                  data-testid="textarea-moderation-notes"
                />
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-moderate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModerateContent}
              disabled={moderateContentMutation.isPending || !moderationAction}
              data-testid="button-confirm-moderate"
            >
              {moderateContentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Take Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-flag-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Flagged Content Details
            </DialogTitle>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <Badge className={targetTypeColors[selectedFlag.targetType as keyof typeof targetTypeColors]}>
                    {selectedFlag.targetType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedFlag.status]}>
                    {selectedFlag.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Reporter</label>
                  <p className="text-sm text-muted-foreground">{getReporterDisplayName(selectedFlag)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Content</label>
                  <p className="text-sm text-muted-foreground">{getTargetDisplayInfo(selectedFlag)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason for Report</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedFlag.reason}</p>
              </div>
              
              {selectedFlag.description && (
                <div>
                  <label className="text-sm font-medium">Additional Description</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFlag.description}</p>
                </div>
              )}
              
              {selectedFlag.target?.content && (
                <div>
                  <label className="text-sm font-medium">Content Preview</label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {selectedFlag.target.content}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Reported On</label>
                  <p>{formatDate(selectedFlag.createdAt)}</p>
                </div>
                {selectedFlag.resolvedAt && (
                  <div>
                    <label className="font-medium">Resolved On</label>
                    <p>{formatDate(selectedFlag.resolvedAt)}</p>
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