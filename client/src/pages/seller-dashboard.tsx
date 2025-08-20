import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Plus, Eye, Edit, Trash2, Package, DollarSign, Users, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function SellerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/seller/dashboard"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      toast({
        title: "Listing Deleted",
        description: "Your listing has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!dashboardData?.seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Become a Seller</h1>
          <p className="text-foreground/70 mb-8">You need to set up your seller profile first.</p>
          <Link to="/seller/onboard">
            <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-setup-seller">
              Set Up Seller Profile
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { seller, listings, orders, stats } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8" data-testid="dashboard-header">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">
              Seller Dashboard
            </h1>
            <p className="text-foreground/70">
              Welcome back, {seller.shopName}
            </p>
          </div>
          <Link to="/seller/listings/create">
            <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-create-listing">
              <Plus className="mr-2" size={16} />
              Create Listing
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-gothic-red" data-testid="stat-total-sales">
                    {stats.totalSales}
                  </p>
                </div>
                <DollarSign className="text-gothic-red" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">Active Listings</p>
                  <p className="text-2xl font-bold text-gothic-purple" data-testid="stat-active-listings">
                    {listings.filter((l: any) => l.state === 'published').length}
                  </p>
                </div>
                <Package className="text-gothic-purple" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">Reviews</p>
                  <p className="text-2xl font-bold text-yellow-500" data-testid="stat-reviews">
                    {stats.totalReviews}
                  </p>
                </div>
                <Users className="text-yellow-500" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-gothic-red" data-testid="stat-avg-rating">
                    {stats.averageRating.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="text-gothic-red" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6" data-testid="dashboard-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings" data-testid="tab-listings">Listings</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Shop Profile</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4" data-testid="content-listings">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">Your Listings</h2>
              <Link to="/seller/listings/create">
                <Button variant="outline" data-testid="button-create-listing-tab">
                  <Plus className="mr-2" size={16} />
                  New Listing
                </Button>
              </Link>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-4" data-testid="listings-list">
                {listings.map((listing: any) => (
                  <Card key={listing.id} className="glass-effect" data-testid={`listing-${listing.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center">
                            {listing.images?.[0]?.url ? (
                              <img
                                src={listing.images[0].url}
                                alt={listing.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="text-foreground/40" size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg" data-testid={`listing-title-${listing.id}`}>
                              {listing.title}
                            </h3>
                            <p className="text-foreground/60 text-sm line-clamp-1">
                              {listing.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-gothic-red font-bold" data-testid={`listing-price-${listing.id}`}>
                                ${listing.price}
                              </span>
                              <Badge
                                variant={listing.state === 'published' ? 'default' : 'secondary'}
                                data-testid={`listing-status-${listing.id}`}
                              >
                                {listing.state}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link to={`/product/${listing.slug}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-${listing.id}`}>
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${listing.id}`}>
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteListingMutation.mutate(listing.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${listing.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-effect" data-testid="no-listings">
                <CardContent className="p-12 text-center">
                  <Package className="mx-auto mb-4 text-foreground/40" size={48} />
                  <h3 className="text-xl font-serif font-bold mb-2">No Listings Yet</h3>
                  <p className="text-foreground/70 mb-6">
                    Create your first listing to start selling your oddities.
                  </p>
                  <Link to="/seller/listings/create">
                    <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-create-first-listing">
                      Create Your First Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4" data-testid="content-orders">
            <h2 className="text-2xl font-serif font-bold">Recent Orders</h2>
            
            {orders.length > 0 ? (
              <div className="space-y-4" data-testid="orders-list">
                {orders.map((order: any) => (
                  <Card key={order.id} className="glass-effect" data-testid={`order-${order.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold mb-1" data-testid={`order-id-${order.id}`}>
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-foreground/60 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gothic-red font-bold text-lg" data-testid={`order-total-${order.id}`}>
                            ${order.total}
                          </p>
                          <Badge
                            variant={order.status === 'fulfilled' ? 'default' : 'secondary'}
                            data-testid={`order-status-${order.id}`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-effect" data-testid="no-orders">
                <CardContent className="p-12 text-center">
                  <DollarSign className="mx-auto mb-4 text-foreground/40" size={48} />
                  <h3 className="text-xl font-serif font-bold mb-2">No Orders Yet</h3>
                  <p className="text-foreground/70">
                    Orders will appear here once customers start purchasing your items.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4" data-testid="content-profile">
            <h2 className="text-2xl font-serif font-bold">Shop Profile</h2>
            
            <Card className="glass-effect" data-testid="shop-profile">
              <CardHeader>
                <CardTitle className="font-serif">{seller.shopName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-foreground/80" data-testid="shop-bio">
                    {seller.bio || 'No bio provided'}
                  </p>
                </div>
                
                {seller.location && (
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-foreground/80" data-testid="shop-location">
                      {seller.location}
                    </p>
                  </div>
                )}
                
                {seller.policies && (
                  <div>
                    <h4 className="font-medium mb-2">Shop Policies</h4>
                    <p className="text-foreground/80" data-testid="shop-policies">
                      {seller.policies}
                    </p>
                  </div>
                )}
                
                <Button variant="outline" data-testid="button-edit-profile">
                  <Edit className="mr-2" size={16} />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
