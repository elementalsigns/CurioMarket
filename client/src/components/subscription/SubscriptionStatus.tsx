import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Calendar, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface SubscriptionStatusProps {
  onManageSubscription?: () => void;
}

export default function SubscriptionStatus({ onManageSubscription }: SubscriptionStatusProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: !!user,
  });
  
  const { data: billingHistory, isLoading: billingLoading } = useQuery({
    queryKey: ['/api/subscription/billing-history'],
    enabled: !!user,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/seller/subscription/cancel');
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/subscription/reactivate');
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate subscription",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-800 text-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-800 text-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" />Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-800 text-red-100"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>;
      case 'incomplete':
        return <Badge className="bg-orange-800 text-orange-100"><AlertTriangle className="w-3 h-3 mr-1" />Incomplete</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your seller subscription? This will remove your ability to create new listings at the end of your current billing period.')) {
      return;
    }
    cancelMutation.mutate();
  };

  const handleReactivateSubscription = async () => {
    if (!confirm('Reactivate your subscription? You will continue to be charged monthly.')) {
      return;
    }
    reactivateMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
            <div className="h-8 bg-zinc-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if ((user as any)?.role !== 'seller') {
    return (
      <Alert className="border-yellow-800 bg-yellow-900/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-yellow-400">
          No active seller subscription found. Subscribe to start selling on Curio Market.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Seller Subscription
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Manage your Curio Market seller subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Status</p>
            {getStatusBadge((user as any)?.subscriptionStatus || 'unknown')}
          </div>
          <div>
            <p className="text-sm text-zinc-400">Plan</p>
            <p className="text-white font-medium">Seller Plan - $10/month</p>
          </div>
        </div>

        {(user as any)?.subscriptionStatus === 'active' && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Subscription Benefits</h4>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Create unlimited listings</li>
              <li>• Professional seller dashboard</li>
              <li>• Order management & analytics</li>
              <li>• Direct customer messaging</li>
              <li>• Only 3% platform fee per sale</li>
            </ul>
          </div>
        )}

        {(user as any)?.subscriptionStatus === 'past_due' && (
          <Alert className="border-yellow-800 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Your subscription payment is past due. Please update your payment method to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {onManageSubscription && (
            <Button
              onClick={onManageSubscription}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Manage Billing
            </Button>
          )}
          
          {(user as any)?.subscriptionStatus === 'active' && (
            <Button
              onClick={handleCancelSubscription}
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-900/20"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}