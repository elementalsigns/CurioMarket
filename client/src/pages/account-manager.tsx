import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { 
  User, 
  Settings, 
  Heart, 
  ShoppingBag, 
  Star, 
  Package, 
  Calendar,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  Store,
  BarChart3,
  Plus,
  Edit3,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export default function AccountManager() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get initial tab from URL parameter
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    // Handle 'orders' as 'purchases' for backward compatibility
    if (tabParam === 'orders') return 'purchases';
    return tabParam || "overview";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        email: (user as any)?.email || "",
      });
    }
  }, [user, form]);

  // Check if user has seller account
  const { data: sellerData } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: sellerListings } = useQuery({
    queryKey: ["/api/seller/listings"],
    enabled: !!user && !!sellerData,
  });

  const { data: sellerStats } = useQuery({
    queryKey: ["/api/seller/stats"],
    enabled: !!user && !!sellerData,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isSeller = !!sellerData;
  const pageTitle = isSeller ? "Shop Manager" : "Your Account";

  return (
    <div className="min-h-screen bg-background" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 space-y-2">
            <div className="bg-card rounded-lg p-6 mb-6" data-testid="profile-card">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16" data-testid="user-avatar">
                  <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                  <AvatarFallback>{(user as any)?.firstName?.[0] || 'U'}{(user as any)?.lastName?.[0] || ''}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold" data-testid="user-name">{(user as any)?.firstName} {(user as any)?.lastName}</h2>
                  <p className="text-muted-foreground" data-testid="user-email">{(user as any)?.email}</p>
                  {isSeller && <Badge className="mt-1 bg-gothic-red">Seller</Badge>}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
                data-testid="nav-overview"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {isSeller ? "Shop Overview" : "Account Overview"}
              </Button>

              {isSeller && (
                <>
                  <Button
                    variant={activeTab === "listings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("listings")}
                    data-testid="nav-listings"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Your Listings
                  </Button>
                  <Button
                    variant={activeTab === "orders-seller" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders-seller")}
                    data-testid="nav-orders-seller"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Orders
                  </Button>
                  <Button
                    variant={activeTab === "shop-stats" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("shop-stats")}
                    data-testid="nav-shop-stats"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Shop Stats
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messages")}
                    data-testid="nav-messages"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </>
              )}

              <Button
                variant={activeTab === "purchases" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("purchases")}
                data-testid="nav-purchases"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Your Purchases
              </Button>

              <Button
                variant={activeTab === "favorites" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("favorites")}
                data-testid="nav-favorites"
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </Button>

              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
                data-testid="nav-profile"
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>

              <Button
                variant={activeTab === "billing" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("billing")}
                data-testid="nav-billing"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isSeller ? "Billing & Payouts" : "Payment Methods"}
              </Button>

              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("notifications")}
                data-testid="nav-notifications"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>

              <Button
                variant={activeTab === "privacy" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("privacy")}
                data-testid="nav-privacy"
              >
                <Shield className="mr-2 h-4 w-4" />
                Privacy Settings
              </Button>

              {!isSeller && (
                <div className="pt-4 border-t">
                  <Link to="/seller/terms">
                    <Button className="w-full bg-gothic-red hover:bg-gothic-red/80" data-testid="button-become-seller">
                      <Store className="mr-2 h-4 w-4" />
                      Become a Seller
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-card rounded-lg p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold" data-testid="page-title">{pageTitle}</h1>
                <p className="text-muted-foreground mt-2">
                  {isSeller ? "Manage your shop, listings, and sales" : "Manage your account settings and purchases"}
                </p>
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6" data-testid="overview-content">
                  {isSeller ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Total Listings</p>
                                <p className="text-2xl font-bold">{(sellerListings as any)?.length || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Total Sales</p>
                                <p className="text-2xl font-bold">{(sellerStats as any)?.totalSales || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Revenue</p>
                                <p className="text-2xl font-bold">${(sellerStats as any)?.totalRevenue || "0.00"}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Avg Rating</p>
                                <p className="text-2xl font-bold">{(sellerStats as any)?.averageRating || "N/A"}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <TrendingUp className="mr-2" />
                              Recent Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">No recent activity</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Plus className="mr-2" />
                              Quick Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Link to="/seller/listings/create">
                              <Button className="w-full" data-testid="button-create-listing">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Listing
                              </Button>
                            </Link>
                            <Link to="/seller/dashboard">
                              <Button variant="outline" className="w-full" data-testid="button-dashboard">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Dashboard
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Orders</p>
                                <p className="text-2xl font-bold">{(orders as any)?.length || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Heart className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Favorites</p>
                                <p className="text-2xl font-bold">{(favorites as any)?.length || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Member Since</p>
                                <p className="text-sm font-bold">
                                  {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Store className="mr-2" />
                              Interested in Selling?
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              Turn your passion for oddities into income. Join our community of collectors and sellers.
                            </p>
                            <Link to="/seller/terms">
                              <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-learn-selling">
                                Learn About Selling
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Profile Settings Tab */}
              {activeTab === "profile" && (
                <div data-testid="profile-settings">
                  <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" data-testid="input-email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                    <Button variant="destructive" onClick={handleLogout} data-testid="button-logout">
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}

              {/* Purchases Tab */}
              {activeTab === "purchases" && (
                <div data-testid="purchases-content">
                  <h2 className="text-xl font-bold mb-4">Your Purchases</h2>
                  {orders && (orders as any).length > 0 ? (
                    <div className="space-y-4">
                      {(orders as any).map((order: any) => (
                        <Card key={order.id} data-testid={`order-${order.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                                <p className="text-muted-foreground text-sm">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <Badge className="mt-1">{order.status}</Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${order.total}</p>
                                <Link to={`/orders/${order.id}`}>
                                  <Button variant="outline" size="sm" className="mt-2" data-testid={`button-view-details-${order.id}`}>
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                        <p className="text-muted-foreground mb-4">
                          When you make your first purchase, it will appear here.
                        </p>
                        <Link to="/browse">
                          <Button data-testid="button-browse-products">Browse Products</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div data-testid="favorites-content">
                  <h2 className="text-xl font-bold mb-4">Your Favorites</h2>
                  {favorites && (favorites as any).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(favorites as any).map((item: any) => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Items you favorite will appear here for easy access.
                        </p>
                        <Link to="/browse">
                          <Button data-testid="button-browse-favorites">Start Browsing</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Seller Listings Tab */}
              {activeTab === "listings" && isSeller && (
                <div data-testid="seller-listings">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Listings</h2>
                    <Link to="/seller/listings/create">
                      <Button data-testid="button-add-listing">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Listing
                      </Button>
                    </Link>
                  </div>
                  {sellerListings && (sellerListings as any).length > 0 ? (
                    <div className="space-y-4">
                      {(sellerListings as any).map((listing: any) => (
                        <Card key={listing.id} data-testid={`listing-${listing.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex space-x-4">
                                <img
                                  src={listing.images?.[0] || "/placeholder-image.jpg"}
                                  alt={listing.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h3 className="font-medium">{listing.title}</h3>
                                  <p className="text-muted-foreground text-sm">{listing.category}</p>
                                  <Badge className="mt-1">{listing.status}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${listing.price}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first listing to start selling on Curio Market.
                        </p>
                        <Link to="/seller/listings/create">
                          <Button data-testid="button-create-first-listing">Create Your First Listing</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Placeholder tabs for future implementation */}
              {activeTab === "orders-seller" && (
                <div data-testid="seller-orders">
                  <h2 className="text-xl font-bold mb-4">Shop Orders</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground">Orders for your listings will appear here.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "shop-stats" && (
                <div data-testid="shop-stats">
                  <h2 className="text-xl font-bold mb-4">Shop Statistics</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Statistics Coming Soon</h3>
                      <p className="text-muted-foreground">Detailed analytics and insights will be available here.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "messages" && (
                <div data-testid="messages">
                  <h2 className="text-xl font-bold mb-4">Messages</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No messages</h3>
                      <p className="text-muted-foreground">Customer messages will appear here.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "billing" && (
                <div data-testid="billing">
                  <h2 className="text-xl font-bold mb-4">{isSeller ? "Billing & Payouts" : "Payment Methods"}</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Payment Settings</h3>
                      <p className="text-muted-foreground">
                        {isSeller ? "Manage your subscription and payout methods." : "Manage your payment methods and billing."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "notifications" && (
                <div data-testid="notifications">
                  <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                      <p className="text-muted-foreground">Customize how you receive updates and alerts.</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "privacy" && (
                <div data-testid="privacy">
                  <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Privacy & Security</h3>
                      <p className="text-muted-foreground">Control your privacy settings and account security.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}