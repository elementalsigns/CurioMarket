import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  ShoppingBag,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/footer";

export default function OrderDetails() {
  const [, params] = useRoute("/orders/:orderId");
  const { toast } = useToast();
  const orderId = params?.orderId;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const response = await apiRequest("GET", `/api/orders/${orderId}`);
      return response;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const errorMessage = error?.message || 'Unknown error';
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('401');
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">
              {isAuthError ? 'Authentication Required' : 'Order Not Found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isAuthError ? (
                <>
                  You need to be logged in to view order details.
                  <br />
                  <small className="text-xs">
                    Note: If you're testing on the production domain, try accessing via the development URL for full functionality.
                  </small>
                </>
              ) : (
                "We couldn't find the order you're looking for."
              )}
            </p>
            <div className="space-y-3">
              {isAuthError && (
                <Link to="/api/login">
                  <Button className="bg-gothic-red hover:bg-gothic-red/80 mr-3">
                    Log In
                  </Button>
                </Link>
              )}
              <Link to="/account?tab=purchases">
                <Button variant="outline">Back to Orders</Button>
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-left">
                <p className="font-medium mb-2">Debug Info:</p>
                <p>Error: {errorMessage}</p>
                <p>Order ID: {orderId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/account?tab=purchases">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Your Purchases
              </Button>
            </Link>
          </div>

          {/* Order Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-1`}>
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item: any, index: number) => {
                      console.log(`[ORDER-DETAILS] Item ${index}:`, item);
                      console.log(`[ORDER-DETAILS] Item image:`, item.image, typeof item.image);
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`order-item-${index}`}>
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                          {item.image && typeof item.image === 'string' && item.image.length > 0 ? (
                            (() => {
                              // Extract image ID from the full Google Cloud Storage URL
                              const imageId = item.image.includes('/.private/uploads/') 
                                ? item.image.split('/.private/uploads/').pop() 
                                : item.image;
                              
                              const proxyUrl = imageId !== item.image 
                                ? `/api/image-proxy/${imageId}` 
                                : item.image;
                              
                              return (
                                <img 
                                  src={proxyUrl} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  data-testid={`order-item-image-${index}`}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              );
                            })()
                          ) : item.image && Array.isArray(item.image) && item.image.length > 0 && item.image[0]?.url ? (
                            <img 
                              src={item.image[0].url} 
                              alt={item.image[0].alt || item.title}
                              className="w-full h-full object-cover"
                              data-testid={`order-item-image-${index}`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-medium" data-testid={`order-item-title-${index}`}>
                            {item.title}
                          </h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-muted-foreground" data-testid={`order-item-quantity-${index}`}>
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`order-item-unit-price-${index}`}>
                              ${parseFloat(item.price || 0).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        
                        {/* Total Price & Review Button */}
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-lg" data-testid={`order-item-total-${index}`}>
                            ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </p>
                          {/* Review Button - Only show if order is delivered and not already reviewed */}
                          {(order.status === 'delivered' || order.status === 'fulfilled') && !item.hasReviewed && (
                            <Link to={`/product/${item.slug}?review=true&orderId=${order.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                data-testid={`button-review-${index}`}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Write Review
                              </Button>
                            </Link>
                          )}
                          {item.hasReviewed && (
                            <p className="text-sm text-green-600">✓ Reviewed</p>
                          )}
                        </div>
                      </div>
                      );
                    })}
                    
                    {/* Handle case where no items exist */}
                    {(!order.items || order.items.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No items found for this order</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {order.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tracking Information */}
              {order.trackingNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Tracking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Carrier:</span>
                        <span className="text-sm font-medium">{order.carrier || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tracking Number:</span>
                        <span className="text-sm font-mono">{order.trackingNumber}</span>
                      </div>
                      {order.shippedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Shipped Date:</span>
                          <span className="text-sm">
                            {new Date(order.shippedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${(parseFloat(order.total) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-base">
                      <span>Total:</span>
                      <span>${(parseFloat(order.total) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <p className="font-medium">Order Placed</p>
                        <p className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {order.status === 'shipped' || order.status === 'delivered' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-sm">
                          <p className="font-medium">Order Shipped</p>
                          <p className="text-muted-foreground">
                            {order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : 'Date pending'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Awaiting shipment</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'delivered' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-sm">
                          <p className="font-medium">Order Delivered</p>
                          <p className="text-muted-foreground">
                            {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Today'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Awaiting delivery</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have questions about your order? Our support team is here to help.
                  </p>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}