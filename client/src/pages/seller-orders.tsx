import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye,
  Mail,
  DollarSign,
  Calendar,
  MapPin
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function SellerOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // Get seller orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/seller/orders"],
  });

  // Ensure orders is always an array
  const ordersList = Array.isArray(orders) ? orders : [];

  // Ship order mutation
  const shipOrderMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber, carrier }: any) => {
      return await apiRequest("POST", `/api/orders/${orderId}/ship`, {
        trackingNumber,
        carrier
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/orders"] });
      toast({
        title: "Order shipped",
        description: "Customer has been notified with tracking information",
      });
      setShowShipModal(false);
      setTrackingNumber("");
      setCarrier("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  // Mark delivered mutation
  const deliverOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/orders/${orderId}/deliver`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/orders"] });
      toast({
        title: "Order marked as delivered",
        description: "Customer has been notified of delivery",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fulfilled':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'paid':
        return <DollarSign size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
      case 'fulfilled':
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const canShip = (order: any) => order.status === 'paid';
  const canMarkDelivered = (order: any) => order.status === 'shipped';

  const handleShip = (order: any) => {
    setSelectedOrder(order);
    setShowShipModal(true);
  };

  const submitShipping = () => {
    if (!trackingNumber || !carrier) {
      toast({
        title: "Missing information",
        description: "Please enter both tracking number and carrier",
        variant: "destructive",
      });
      return;
    }

    shipOrderMutation.mutate({
      orderId: selectedOrder.id,
      trackingNumber,
      carrier
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-zinc-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-bold">Order Management</h1>
            <Link to="/seller/dashboard">
              <Button variant="outline" data-testid="button-back-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-zinc-400 mt-2">
            Manage your orders, add tracking information, and keep customers updated
          </p>
        </div>

        {ordersList.length > 0 ? (
          <div className="space-y-6" data-testid="orders-list">
            {ordersList.map((order: any) => (
              <Card key={order.id} className="glass-effect border-zinc-800" data-testid={`order-${order.id}`}>
                <CardHeader className="border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-xl">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          ${order.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(order.status)} flex items-center gap-1`}
                        data-testid={`order-status-${order.id}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status === 'fulfilled' ? 'completed' : order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-zinc-400" />
                        <span className="font-medium">Shipping Address</span>
                      </div>
                      <div className="text-sm text-zinc-300">
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.shippingAddress?.tracking && (
                    <div className="mb-4 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck size={16} className="text-green-400" />
                        <span className="font-medium text-green-300">Tracking Information</span>
                      </div>
                      <div className="text-sm">
                        <p><span className="text-zinc-400">Carrier:</span> {order.shippingAddress.tracking.carrier}</p>
                        <p><span className="text-zinc-400">Tracking:</span> {order.shippingAddress.tracking.trackingNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-${order.id}`}>
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                    </Link>

                    {canShip(order) && (
                      <Button 
                        onClick={() => handleShip(order)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-ship-${order.id}`}
                      >
                        <Truck size={16} className="mr-2" />
                        Mark as Shipped
                      </Button>
                    )}

                    {canMarkDelivered(order) && (
                      <Button 
                        onClick={() => deliverOrderMutation.mutate(order.id)}
                        disabled={deliverOrderMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`button-deliver-${order.id}`}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-zinc-800" data-testid="no-orders">
            <CardContent className="p-12 text-center">
              <Package className="mx-auto mb-4 text-zinc-400" size={48} />
              <h3 className="text-xl font-serif font-bold mb-2">No Orders Yet</h3>
              <p className="text-zinc-400 mb-6">
                Orders will appear here once customers start purchasing your items.
              </p>
              <Link to="/seller/dashboard">
                <Button className="bg-gothic-red hover:bg-gothic-red/80">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Shipping Modal */}
        <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
          <DialogContent className="bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="font-serif">
                Mark Order as Shipped
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="carrier">Shipping Carrier</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="USPS">USPS</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-tracking-number"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <Mail size={16} className="text-blue-400" />
                <span className="text-sm text-blue-300">
                  Customer will automatically receive an email with tracking information
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={submitShipping}
                  disabled={shipOrderMutation.isPending}
                  className="bg-gothic-red hover:bg-gothic-red/80"
                  data-testid="button-confirm-ship"
                >
                  {shipOrderMutation.isPending ? "Updating..." : "Mark as Shipped"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShipModal(false)}
                  data-testid="button-cancel-ship"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}