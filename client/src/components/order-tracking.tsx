import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  MessageSquare,
  Copy,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderTrackingProps {
  orderId: string;
  showSellerActions?: boolean;
}

interface TrackingStatus {
  id: string;
  status: string;
  location?: string;
  timestamp: string;
  description: string;
  carrier?: string;
}

export default function OrderTracking({ orderId, showSellerActions = false }: OrderTrackingProps) {
  const { toast } = useToast();
  const [updateModal, setUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // Get order details and tracking
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
  });

  const { data: trackingHistory } = useQuery({
    queryKey: ["/api/orders", orderId, "tracking"],
  });

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return await apiRequest("POST", `/api/orders/${orderId}/tracking`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId, "tracking"] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
      setUpdateModal(false);
      setStatusNotes("");
    },
  });

  // Get estimated delivery
  const getEstimatedDelivery = (createdAt: string, processingTime: number = 3) => {
    const orderDate = new Date(createdAt);
    const estimated = new Date(orderDate);
    estimated.setDate(estimated.getDate() + processingTime + 5); // processing + shipping
    return estimated.toLocaleDateString();
  };

  // Get status progress
  const getStatusProgress = (status: string) => {
    const statusMap: { [key: string]: number } = {
      'pending': 0,
      'confirmed': 25,
      'processing': 50,
      'shipped': 75,
      'delivered': 100,
      'cancelled': 0,
    };
    return statusMap[status] || 0;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'processing': 'bg-purple-500',
      'shipped': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500',
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast({
        title: "Status required",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    updateStatusMutation.mutate({
      status: newStatus,
      notes: statusNotes,
      trackingNumber: trackingNumber || undefined,
      carrier: carrier || undefined,
    });
  };

  const copyTrackingNumber = () => {
    if (orderData?.trackingNumber) {
      navigator.clipboard.writeText(orderData.trackingNumber);
      toast({
        title: "Copied",
        description: "Tracking number copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
            <div className="h-8 bg-zinc-700 rounded"></div>
            <div className="h-32 bg-zinc-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const order = orderData || {};
  const progress = getStatusProgress(order.status);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Order #{order.id?.slice(0, 8)}</h2>
              <p className="text-zinc-400">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`px-3 py-1 text-white border-none ${getStatusColor(order.status)}`}
            >
              {order.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Order Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Customer</h4>
              <p className="text-zinc-300">{order.buyerName}</p>
              <p className="text-zinc-400 text-sm">{order.buyerEmail}</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Total</h4>
              <p className="text-2xl font-bold text-white">${order.total}</p>
              <p className="text-zinc-400 text-sm">{order.itemCount} items</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Estimated Delivery</h4>
              <p className="text-zinc-300">{getEstimatedDelivery(order.createdAt)}</p>
              <p className="text-zinc-400 text-sm">
                <Calendar size={14} className="inline mr-1" />
                Standard shipping
              </p>
            </div>
          </div>

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white mb-1">Tracking Number</h4>
                  <p className="text-zinc-300 font-mono">{order.trackingNumber}</p>
                  <p className="text-zinc-400 text-sm">Carrier: {order.carrier || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTrackingNumber}
                    className="text-zinc-300 border-zinc-600"
                  >
                    <Copy size={16} className="mr-1" />
                    Copy
                  </Button>
                  {order.carrier && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-zinc-300 border-zinc-600"
                      onClick={() => {
                        // Open carrier tracking page
                        const trackingUrl = getCarrierTrackingUrl(order.carrier, order.trackingNumber);
                        if (trackingUrl) window.open(trackingUrl, '_blank');
                      }}
                    >
                      <ExternalLink size={16} className="mr-1" />
                      Track
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="mr-2" size={20} />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {trackingHistory?.map((event: TrackingStatus, index: number) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-red-500' : 'bg-zinc-600'
                } mt-2`}></div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white">{event.description}</h4>
                    <span className="text-zinc-400 text-sm">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {event.location && (
                    <p className="text-zinc-400 text-sm flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!trackingHistory || trackingHistory.length === 0) && (
              <div className="text-center py-8">
                <Clock size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No tracking updates yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seller Actions */}
      {showSellerActions && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white">Update Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Status
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Carrier
                </label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USPS">USPS</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tracking Number (optional)
                </label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notes (optional)
              </label>
              <Textarea
                placeholder="Add any additional notes about this status update..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to get carrier tracking URLs
function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const urls: { [key: string]: string } = {
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };
  
  return urls[carrier] || null;
}