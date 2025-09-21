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
import { Search, Trash2, Eye, MoreHorizontal, Calendar, User, MapPin, Users, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  endDate?: string;
  price?: string;
  maxAttendees?: number;
  currentAttendees: number;
  status: 'draft' | 'published' | 'cancelled' | 'suspended' | 'hidden' | 'flagged' | 'expired';
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  imageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  tags?: string[];
}

interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  published: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  suspended: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
  hidden: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  flagged: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  expired: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
};

const statusOptions = [
  { value: "all", label: "All Events" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "suspended", label: "Suspended" },
  { value: "hidden", label: "Hidden" },
  { value: "flagged", label: "Flagged" },
  { value: "expired", label: "Expired" }
];

export function EventsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();
  
  const limit = 10;

  // Fetch events with search and filtering
  const { data: eventsData, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ['/api/admin/events', { search, status: statusFilter !== 'all' ? statusFilter : undefined, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const url = `/api/admin/events?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/events/${eventId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  // Update event status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/events/${eventId}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Status Updated",
        description: `Event status has been changed to ${newStatus}.`,
      });
      setIsStatusDialogOpen(false);
      setSelectedEvent(null);
      setNewStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update event status",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent.id);
    }
  };

  const handleStatusChange = () => {
    if (selectedEvent && newStatus) {
      updateStatusMutation.mutate({ eventId: selectedEvent.id, status: newStatus });
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const getUserDisplayName = (event: Event) => {
    if (event.user?.firstName && event.user?.lastName) {
      return `${event.user.firstName} ${event.user.lastName}`;
    }
    return event.user?.email || 'Unknown User';
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading events</p>
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
            placeholder="Search events by title, description, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-events"
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

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events Management
          </CardTitle>
          <CardDescription>
            {eventsData ? `${eventsData.total} total events` : 'Loading events...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading events...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsData?.events.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getUserDisplayName(event)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatEventDate(event.eventDate)}
                          </div>
                          {event.endDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Until {formatEventDate(event.endDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          <span>{event.currentAttendees}</span>
                          {event.maxAttendees && (
                            <span className="text-muted-foreground">/ {event.maxAttendees}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[event.status]} data-testid={`badge-status-${event.status}`}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-${event.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              setSelectedEvent(event);
                              setNewStatus(value);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <SelectTrigger className="w-8 h-8 p-0 border-none" data-testid={`select-status-${event.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.slice(1).map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  Change to {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            data-testid={`button-delete-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {eventsData?.events.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No events found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {eventsData && eventsData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {eventsData.page} of {eventsData.totalPages} ({eventsData.total} total events)
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
                      disabled={page >= eventsData.totalPages}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
              All registrations and associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent data-testid="dialog-status-change">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Event Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of "{selectedEvent?.title}" to {newStatus}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-status">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={updateStatusMutation.isPending}
              data-testid="button-confirm-status"
            >
              {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-event-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={statusColors[selectedEvent.status]}>{selectedEvent.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Creator</label>
                  <p className="text-sm text-muted-foreground">{getUserDisplayName(selectedEvent)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Event Date</label>
                  <p className="text-sm text-muted-foreground">{formatEventDate(selectedEvent.eventDate)}</p>
                </div>
                {selectedEvent.endDate && (
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <p className="text-sm text-muted-foreground">{formatEventDate(selectedEvent.endDate)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Attendees</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.currentAttendees}
                    {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees}`}
                  </p>
                </div>
                {selectedEvent.price && (
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <p className="text-sm text-muted-foreground">${selectedEvent.price}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
              </div>
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Created</label>
                  <p>{formatEventDate(selectedEvent.createdAt)}</p>
                </div>
                <div>
                  <label className="font-medium">Last Updated</label>
                  <p>{formatEventDate(selectedEvent.updatedAt)}</p>
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