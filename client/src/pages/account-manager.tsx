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
  FileText,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import MessagingSystem from "@/components/messaging-system";
import { ObjectUploader } from "@/components/ObjectUploader";

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
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      profileImageUrl: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      const profileImageUrl = (user as any)?.profileImageUrl || "";
      setCurrentProfileImage(profileImageUrl);
      form.reset({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        email: (user as any)?.email || "",
        profileImageUrl: profileImageUrl,
      });
    }
  }, [user, form]);

  // Check if user has seller account
  const { data: sellerData } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  // Get unread message count
  const { data: unreadData } = useQuery({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  }) as { data: { count: number } | undefined };

  // Get favorites with full listing data
  const { data: favoriteListings } = useQuery({
    queryKey: ["/api/favorites/listings"],
    enabled: !!user,
  });

  // Keep original favorites query for the counter (backwards compatibility)
  const { data: favoriteIds } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: sellerDashboardData } = useQuery({
    queryKey: ["/api/seller/dashboard", "v2"],
    queryFn: async () => {
      const response = await fetch("/api/seller/dashboard", { 
        credentials: 'include',
        cache: 'no-cache' // Force fresh request
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    enabled: !!user && !!sellerData,
  });

  // Get subscription data for billing
  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription/status"],
    enabled: !!user,
    retry: false,
  });

  const sellerListings = sellerDashboardData?.listings;

  const { data: sellerOrders } = useQuery({
    queryKey: ["/api/seller/orders"],
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

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: (listingId: string) => apiRequest("DELETE", `/api/listings/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/listings"] });
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully.",
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
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle favorites mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        return apiRequest("DELETE", `/api/favorites/${listingId}`);
      } else {
        return apiRequest("POST", "/api/favorites", { listingId });
      }
    },
    onSuccess: () => {
      // Invalidate all favorites-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: (error: any) => {
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
      if (error.message?.includes('Authentication required')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to favorites.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update favorites. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleToggleFavorite = (listingId: string, isFavorited: boolean) => {
    toggleFavoriteMutation.mutate({ listingId, isFavorited });
  };

  // Profile picture upload handlers
  const handleGetProfilePictureUploadUrl = async () => {
    const response = await apiRequest("POST", "/api/user/profile-picture/upload-url");
    return response;
  };

  const handleProfilePictureUploadComplete = (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedImageUrl = result.successful[0].uploadURL;
      setCurrentProfileImage(uploadedImageUrl);
      form.setValue("profileImageUrl", uploadedImageUrl);
      
      // Automatically save the profile picture to database
      updateProfileMutation.mutate({
        ...form.getValues(),
        profileImageUrl: uploadedImageUrl
      });
      
      toast({
        title: "Profile picture uploaded",
        description: "Your profile picture has been uploaded successfully.",
      });
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate({
      ...data,
      profileImageUrl: currentProfileImage || data.profileImageUrl
    });
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
                    {unreadData?.count && unreadData.count > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadData.count}
                      </Badge>
                    )}
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

              {!isSeller && (
                <Button
                  variant={activeTab === "messages" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("messages")}
                  data-testid="nav-messages-buyer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                  {unreadData?.count && unreadData.count > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadData.count}
                    </Badge>
                  )}
                </Button>
              )}

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
                                <p className="text-2xl font-bold">{(sellerStats as any)?.averageRating ? (sellerStats as any).averageRating.toFixed(1) : "N/A"}</p>
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
                                <p className="text-2xl font-bold">{(favoriteIds as any)?.length || 0}</p>
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
                                  {(user as any)?.createdAt ? new Date((user as any).createdAt).getFullYear() : "2024"}
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
                  
                  {/* Profile Picture Section */}
                  <div className="mb-6 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20" data-testid="current-profile-picture">
                        <AvatarImage src={currentProfileImage || (user as any)?.profileImageUrl || ""} />
                        <AvatarFallback className="text-lg">
                          {(user as any)?.firstName?.[0] || 'U'}{(user as any)?.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload a new profile picture. Recommended size: 400x400px
                        </p>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880} // 5MB
                          allowedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                          onGetUploadParameters={handleGetProfilePictureUploadUrl}
                          onComplete={handleProfilePictureUploadComplete}
                          buttonClassName="bg-primary hover:bg-primary/90"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {currentProfileImage ? 'Change Picture' : 'Upload Picture'}
                        </ObjectUploader>
                      </div>
                    </div>
                  </div>

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
                  {favoriteListings && (favoriteListings as any).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(favoriteListings as any).map((listing: any) => (
                        <ProductCard 
                          key={listing.id} 
                          listing={listing} 
                          isFavorited={true}
                          onToggleFavorite={handleToggleFavorite}
                        />
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
                        <Card key={listing.id} data-testid={`listing-${listing.id}`} className="glass-effect">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex space-x-4">
                                <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                                  {listing.images?.[0]?.url ? (
                                    <img
                                      src={`${listing.images[0].url}?cache=${Date.now()}`}
                                      alt={listing.title}
                                      className="w-full h-full object-cover rounded-lg"
                                      style={{ 
                                        aspectRatio: '1/1',
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                      }}
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
                                    {(listing.stockQuantity || 0) < 1 ? (
                                      <Badge variant="destructive" className="text-xs" data-testid={`listing-sold-out-${listing.id}`}>
                                        Sold Out
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground" data-testid={`listing-stock-${listing.id}`}>
                                        {listing.stockQuantity} in stock
                                      </span>
                                    )}
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
                                <Link to={`/seller/listings/edit/${listing.id}`}>
                                  <Button variant="outline" size="sm" data-testid={`button-edit-${listing.id}`}>
                                    <Edit3 size={16} className="mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                                <Button
                                  type="button"
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

              {/* Shop Orders Tab */}
              {activeTab === "orders-seller" && (
                <div className="space-y-4" data-testid="seller-orders">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold">Recent Orders</h2>
                    <Link to="/seller/orders">
                      <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-manage-orders">
                        Manage All Orders
                      </Button>
                    </Link>
                  </div>
                  
                  {(sellerDashboardData?.orders?.length || 0) > 0 ? (
                    <div className="space-y-4" data-testid="orders-list">
                      {(sellerDashboardData?.orders || []).map((order: any) => (
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
                </div>
              )}

              {activeTab === "shop-stats" && (
                <div data-testid="shop-stats">
                  <h2 className="text-xl font-bold mb-4">Shop Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground/60 text-sm">Total Sales</p>
                            <p className="text-2xl font-bold text-green-500" data-testid="stats-total-sales">
                              {sellerStats?.totalSales || 0}
                            </p>
                            <p className="text-xs text-green-500/70">
                              Completed orders
                            </p>
                          </div>
                          <DollarSign className="text-green-500" size={24} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground/60 text-sm">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-500" data-testid="stats-avg-rating">
                              {sellerStats?.averageRating ? sellerStats.averageRating.toFixed(1) : '0.0'}
                            </p>
                            <p className="text-xs text-yellow-500/70">
                              {sellerStats?.totalReviews || 0} reviews
                            </p>
                          </div>
                          <Star className="text-yellow-500" size={24} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground/60 text-sm">Active Listings</p>
                            <p className="text-2xl font-bold text-blue-500" data-testid="stats-active-listings">
                              {sellerData?.listings?.length || 0}
                            </p>
                            <p className="text-xs text-blue-500/70">
                              Items for sale
                            </p>
                          </div>
                          <Package className="text-blue-500" size={24} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground/60 text-sm">Total Favorites</p>
                            <p className="text-2xl font-bold text-purple-500" data-testid="stats-total-favorites">
                              {sellerStats?.totalFavorites || 0}
                            </p>
                            <p className="text-xs text-purple-500/70">
                              People who favorited your items
                            </p>
                          </div>
                          <Heart className="text-purple-500" size={24} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground/60 text-sm">Total Views</p>
                            <p className="text-2xl font-bold text-orange-500" data-testid="stats-total-views">
                              {sellerStats?.totalViews || 0}
                            </p>
                            <p className="text-xs text-orange-500/70">
                              Times your items were viewed
                            </p>
                          </div>
                          <Eye className="text-orange-500" size={24} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="text-gothic-red" size={24} />
                        <h3 className="text-lg font-serif font-bold">Shop Performance</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/70">Customer Satisfaction</span>
                          <span className="font-semibold">
                            {sellerStats?.averageRating ? 'Excellent' : 'Building'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/70">Shop Status</span>
                          <span className="font-semibold text-green-500">Active</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/70">Total Reviews</span>
                          <span className="font-semibold">{sellerStats?.totalReviews || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "messages" && (
                <div data-testid="messages">
                  <h2 className="text-xl font-bold mb-4">
                    {isSeller ? "Customer Messages" : "Your Messages"}
                  </h2>
                  <Card className="glass-effect">
                    <CardContent className="p-0">
                      <MessagingSystem />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "billing" && (
                <div data-testid="billing">
                  <h2 className="text-xl font-bold mb-6">{isSeller ? "Billing & Payouts" : "Payment Methods"}</h2>
                  
                  {isSeller ? (
                    <div className="space-y-6">
                      {/* Seller Subscription */}
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="text-gothic-red" size={20} />
                            Seller Subscription
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-foreground/60">Current Plan</p>
                              <p className="font-semibold">Seller Pro - $10/month</p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Status</p>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={16} />
                                <span className="font-semibold text-green-500">Active</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Next Billing</p>
                              <p className="font-semibold">
                                {subscriptionData?.nextBilling ? 
                                  new Date(subscriptionData.nextBilling).toLocaleDateString() : 
                                  "Loading..."
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Payment Method</p>
                              <p className="font-semibold">•••• •••• •••• 4242</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open('https://billing.stripe.com/p/login', '_blank')}
                          >
                            <ExternalLink className="mr-2" size={16} />
                            Manage Subscription
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Payout Settings */}
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="text-gothic-red" size={20} />
                            Payout Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-foreground/60">Available Balance</p>
                              <p className="text-2xl font-bold text-green-500">
                                ${sellerDashboardData?.seller?.availableBalance || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Pending</p>
                              <p className="text-2xl font-bold text-yellow-500">
                                ${sellerDashboardData?.seller?.pendingBalance || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Next Payout</p>
                              <div className="flex items-center gap-2">
                                <Clock className="text-blue-500" size={16} />
                                <span className="font-semibold">
                                  {sellerDashboardData?.seller?.nextPayoutDate ? 
                                    new Date(sellerDashboardData.seller.nextPayoutDate).toLocaleDateString() : 
                                    "No pending payouts"
                                  }
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60">Bank Account</p>
                              <p className="font-semibold">Chase •••• 4567</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="mr-2" size={16} />
                            Manage Bank Account (Stripe)
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Fee Information */}
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="text-gothic-red" size={20} />
                            Fee Structure
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-foreground/70">Platform Fee</span>
                            <span className="font-semibold">2.6%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-foreground/70">Stripe Processing</span>
                            <span className="font-semibold">2.9% + $0.30</span>
                          </div>
                          <div className="border-t border-border/30 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total Fees</span>
                              <span className="font-semibold text-gothic-red">~5.5%</span>
                            </div>
                          </div>
                          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                            <p className="text-xs text-green-400 font-medium">
                              Example: $100 sale = $94.20 in your pocket
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Activity */}
                      <Card className="glass-effect">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="text-gothic-red" size={20} />
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="text-green-500" size={16} />
                                <div>
                                  <p className="font-medium">Subscription Payment</p>
                                  <p className="text-sm text-foreground/60">Monthly seller fee</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">-$10.00</p>
                                <p className="text-sm text-foreground/60">Dec 26, 2024</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <DollarSign className="text-green-500" size={16} />
                                <div>
                                  <p className="font-medium">Payout Sent</p>
                                  <p className="text-sm text-foreground/60">Weekly earnings</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-500">+$87.50</p>
                                <p className="text-sm text-foreground/60">Dec 23, 2024</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    /* Buyer Payment Methods */
                    <Card className="glass-effect">
                      <CardContent className="p-8 text-center">
                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
                        <p className="text-muted-foreground mb-6">
                          Your payment methods are securely managed during checkout.
                        </p>
                        <div className="space-y-4">
                          <div className="p-4 border border-border/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CreditCard className="text-blue-500" size={20} />
                                <div>
                                  <p className="font-medium">•••• •••• •••• 4242</p>
                                  <p className="text-sm text-foreground/60">Expires 12/2025</p>
                                </div>
                              </div>
                              <Badge>Default</Badge>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full">
                            Add Payment Method
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div data-testid="notifications">
                  <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="mr-2" />
                        Notification Preferences
                      </CardTitle>
                      <p className="text-muted-foreground">Customize how you receive updates and alerts.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Order & Purchase Notifications */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Order Updates</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Order confirmations</Label>
                              <p className="text-sm text-muted-foreground">Get notified when your orders are confirmed</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Shipping updates</Label>
                              <p className="text-sm text-muted-foreground">Track when your items ship</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Delivery notifications</Label>
                              <p className="text-sm text-muted-foreground">Know when your orders arrive</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Marketplace Activity */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Marketplace Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">New items from favorite sellers</Label>
                              <p className="text-sm text-muted-foreground">Be first to know about new listings</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Price drops on wishlisted items</Label>
                              <p className="text-sm text-muted-foreground">Alert when favorited items go on sale</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Messages from sellers</Label>
                              <p className="text-sm text-muted-foreground">Get notified of new conversations</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isSeller && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Seller Notifications</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-base">New orders</Label>
                                <p className="text-sm text-muted-foreground">Instant alerts for new sales</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Email
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-base">Message notifications</Label>
                                <p className="text-sm text-muted-foreground">New messages from {isSeller ? 'customers' : 'sellers'}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-red-600 text-white">
                                  Dashboard
                                </Button>
                                <Button variant="outline" size="sm">
                                  Email
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-base">Low inventory alerts</Label>
                                <p className="text-sm text-muted-foreground">When items are running low</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Email
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-base">Payment notifications</Label>
                                <p className="text-sm text-muted-foreground">Payouts and billing updates</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Email
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Marketing & Updates */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Marketing & Updates</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Weekly newsletter</Label>
                              <p className="text-sm text-muted-foreground">Curated oddities and market trends</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Platform updates</Label>
                              <p className="text-sm text-muted-foreground">New features and improvements</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Special offers</Label>
                              <p className="text-sm text-muted-foreground">Exclusive deals and promotions</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>

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