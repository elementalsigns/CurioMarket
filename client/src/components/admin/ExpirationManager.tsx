import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Clock, CalendarX, Settings, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ExpirationStats {
  eventsToExpire: number;
  daysOld: number;
}

export function ExpirationManager() {
  const [daysOld, setDaysOld] = useState(30);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get events that would be expired
  const { data: previewData, isLoading: isPreviewLoading } = useQuery<ExpirationStats>({
    queryKey: ['/api/admin/events', { status: 'published', daysOld }],
    select: (data: any) => {
      // This is a simplified calculation - in reality you'd want a separate endpoint
      // for getting expiration stats, but this works for the demo
      const oldEvents = data?.events?.filter((event: any) => {
        const eventDate = new Date(event.eventDate);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        return eventDate < cutoffDate && event.status === 'published';
      }) || [];
      
      return {
        eventsToExpire: oldEvents.length,
        daysOld
      };
    },
    staleTime: 30000,
  });

  // Expire old events mutation
  const expireEventsMutation = useMutation({
    mutationFn: async (days: number) => {
      const response = await apiRequest('POST', '/api/admin/events/expire', { daysOld: days });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Events Expired",
        description: `Successfully expired ${data.expiredCount || 0} old events.`,
      });
      setIsConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Expiration Failed",
        description: error.message || "Failed to expire events",
        variant: "destructive",
      });
    },
  });

  const handleExpireEvents = () => {
    expireEventsMutation.mutate(daysOld);
  };

  const previewCount = previewData?.eventsToExpire || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Auto-Expiration Management
          </CardTitle>
          <CardDescription>
            Automatically expire old events to keep your platform current and relevant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Expiration Configuration</Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days-old">Days after event date to expire</Label>
                <Input
                  id="days-old"
                  type="number"
                  min="1"
                  max="365"
                  value={daysOld}
                  onChange={(e) => setDaysOld(parseInt(e.target.value) || 30)}
                  className="w-full"
                  data-testid="input-days-old"
                />
                <p className="text-xs text-muted-foreground">
                  Events that occurred more than this many days ago will be expired
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Events to be expired</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  {isPreviewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium" data-testid="text-events-count">
                    {isPreviewLoading ? "Calculating..." : `${previewCount} events`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Published events from more than {daysOld} days ago
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Manual Expiration</Label>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manually trigger the expiration process to mark old events as expired.
                This helps keep your event listings current and improves user experience.
              </p>
              
              {previewCount > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-950 dark:border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {previewCount} events ready for expiration
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      These events occurred more than {daysOld} days ago and will be marked as expired.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-950 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    No events need expiration with current settings
                  </p>
                </div>
              )}

              <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={previewCount === 0 || isPreviewLoading}
                    className="w-full sm:w-auto"
                    data-testid="button-expire-events"
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Expire Old Events ({previewCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="dialog-expire-confirmation">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Expire Old Events</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        You are about to expire <strong>{previewCount} events</strong> that occurred 
                        more than <strong>{daysOld} days</strong> ago.
                      </p>
                      <p>
                        This action will:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Change the status of these events to "expired"</li>
                        <li>Remove them from public event listings</li>
                        <li>Preserve all registration and historical data</li>
                      </ul>
                      <p className="font-medium">
                        This action cannot be undone. Are you sure you want to continue?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-expire">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleExpireEvents}
                      disabled={expireEventsMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                      data-testid="button-confirm-expire"
                    >
                      {expireEventsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Expire {previewCount} Events
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Separator />

          {/* Information Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">About Event Expiration</Label>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Events are automatically marked as expired when they occur in the past and exceed the configured threshold
              </p>
              <p>
                • Expired events are hidden from public listings but remain accessible for historical purposes
              </p>
              <p>
                • All registration data and attendee information is preserved
              </p>
              <p>
                • Event creators can still view their expired events in their dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}