import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Plus, Eye, Edit, Trash2, Package, DollarSign, Users, TrendingUp, Percent, Tag, Save, Upload, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { SocialSharing } from "@/components/social-sharing";
import type { Promotion, InsertPromotion } from "@shared/schema";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import ShopPage from "@/pages/shop";

export default function SellerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/seller/dashboard", "v2"],
    queryFn: async () => {
      const response = await fetch("/api/seller/dashboard", { 
        credentials: 'include',
        cache: 'no-cache' // Force fresh request
      });
      return await response.json();
    },
    enabled: Boolean(user && ((user as any)?.role === 'seller' || (user as any)?.stripeCustomerId)),
    retry: 3,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  }) as { data: { seller: any; listings: any[]; orders: any[]; stats: any; promotions: any[] } | undefined; isLoading: boolean; error: any };

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

  // Debug logging for production
  useEffect(() => {
    if (user) {
      console.log('[SELLER-DASHBOARD] User data:', {
        userId: (user as any)?.id,
        role: (user as any)?.role,
        stripeCustomerId: (user as any)?.stripeCustomerId,
        hasSellerData: !!dashboardData?.seller,
        isLoading,
        error: error?.message
      });
    }
  }, [user, dashboardData, isLoading, error]);

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
    // Check if user should have access
    const shouldHaveAccess = (user as any)?.role === 'seller' || (user as any)?.stripeCustomerId;
    
    if (shouldHaveAccess && !isLoading) {
      console.log('[SELLER-DASHBOARD] ERROR: Seller should have access but no seller data found');
      console.log('[SELLER-DASHBOARD] Dashboard API Response:', dashboardData);
      console.log('[SELLER-DASHBOARD] User ID:', (user as any)?.id);
      
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-serif font-bold mb-4 text-red-500">Dashboard Loading Error</h1>
            <p className="text-foreground/70 mb-8">
              Unable to load your seller dashboard. This appears to be a temporary server issue.
            </p>
            <div className="space-y-4">
              <Button onClick={() => window.location.reload()} className="bg-gothic-red hover:bg-gothic-red/80">
                Refresh Page
              </Button>
              <br />
              <Link to="/seller/onboard">
                <Button variant="outline" data-testid="button-setup-seller">
                  Re-setup Seller Profile
                </Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
    
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings" data-testid="tab-listings">Listings</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="promotions" data-testid="tab-promotions">Promotions</TabsTrigger>
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
                          <div className="w-20 h-20 bg-card rounded-lg flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
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
                              <Package className="text-foreground/40" size={28} />
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
                          <Link to={`/seller/listings/edit/${listing.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-edit-${listing.id}`}>
                              <Edit size={16} className="mr-1" />
                              Edit
                            </Button>
                          </Link>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Recent Orders</h2>
              <Link to="/seller/orders">
                <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-manage-orders">
                  Manage All Orders
                </Button>
              </Link>
            </div>
            
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

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-4" data-testid="content-promotions">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Discount Codes & Promotions</h2>
              <PromotionDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/seller/promotions"] })} />
            </div>
            
            <PromotionsList />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4" data-testid="content-profile">
            <ShopProfileManager seller={seller} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// Promotion Dialog Component
function PromotionDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InsertPromotion>({
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "0",
      minPurchase: "0",
      maxDiscount: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      maxUses: undefined,
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (data: InsertPromotion) => {
      return apiRequest("POST", "/api/seller/promotions", data);
    },
    onSuccess: () => {
      toast({
        title: "Promotion Created",
        description: "Your discount code has been created successfully",
      });
      setOpen(false);
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPromotion) => {
    createPromotionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-create-promotion">
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Create New Promotion</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SPOOKY20" {...field} data-testid="input-promotion-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-discount-type">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your promotion..." 
                      {...field}
                      value={field.value || ''}
                      data-testid="input-promotion-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("discountType") === "percentage" ? "Percentage (%)" : "Amount ($)"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        {...field} 
                        data-testid="input-discount-value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Purchase ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-min-purchase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Unlimited"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-max-uses"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel-promotion"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPromotionMutation.isPending}
                className="bg-gothic-red hover:bg-gothic-red/80"
                data-testid="button-save-promotion"
              >
                {createPromotionMutation.isPending ? "Creating..." : "Create Promotion"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Shop Profile Manager Component
function ShopProfileManager({ seller }: { seller: any }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(seller?.banner || "");
  const [avatarUrl, setAvatarUrl] = useState(seller?.avatar || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileForm = useForm({
    defaultValues: {
      shopName: seller?.shopName || "",
      bio: seller?.bio || "",
      location: seller?.location || "",
      policies: seller?.policies || "",
      shippingInfo: seller?.shippingInfo || "",
      returnPolicy: seller?.returnPolicy || "",
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/seller/profile", {
        ...data,
        bannerImageUrl: bannerUrl || undefined,
        avatarImageUrl: avatarUrl || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your shop profile has been updated successfully.",
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/seller/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (data: any) => {
    console.log('[PROFILE-SAVE] Submitting with bannerUrl:', bannerUrl);
    console.log('[PROFILE-SAVE] Submitting with avatarUrl:', avatarUrl);
    console.log('[PROFILE-SAVE] Full form data:', data);
    updateProfileMutation.mutate(data);
  };

  if (isEditingProfile) {
    return (
      <Card className="glass-effect" data-testid="shop-profile-editor">
        <CardHeader>
          <CardTitle className="font-serif flex items-center justify-between">
            Edit Shop Profile
            <Button 
              variant="outline" 
              onClick={() => setIsEditingProfile(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
              {/* Shop Images */}
              <div className="space-y-4">
                <h4 className="font-medium">Shop Images</h4>
                
                {/* Banner Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Banner Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Shop banner" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Banner image URL"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="w-64"
                        data-testid="input-banner-url"
                      />
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        allowedFileTypes={['image/*']}
                        onGetUploadParameters={async () => {
                          console.log('[UPLOAD-DEBUG] Making request to /api/objects/upload');
                          try {
                            const res = await apiRequest("POST", "/api/objects/upload");
                            const response = await res.json();
                            console.log('[UPLOAD-DEBUG] Response from server:', response);
                            
                            if (!response) {
                              throw new Error('No response received from server');
                            }
                            
                            if (!response.uploadURL) {
                              throw new Error('Server did not return uploadURL');
                            }
                            
                            return {
                              method: "PUT" as const,
                              url: response.uploadURL,
                            };
                          } catch (error) {
                            console.error('[UPLOAD-DEBUG] Error in onGetUploadParameters:', error);
                            throw error;
                          }
                        }}
                        onComplete={async (result) => {
                          if (result.successful && result.successful[0]) {
                            const uploadURL = result.successful[0].uploadURL;
                            console.log('[BANNER-UPLOAD] Upload completed, processing:', uploadURL);
                            
                            try {
                              // Process the uploaded image URL
                              const res = await apiRequest("PUT", "/api/seller/images", {
                                bannerImageURL: uploadURL
                              });
                              const response = await res.json();
                              
                              if (response.success && response.bannerPath) {
                                setBannerUrl(response.bannerPath);
                                console.log('[BANNER-UPLOAD] Banner path normalized:', response.bannerPath);
                                toast({
                                  title: "Banner Uploaded",
                                  description: "Your shop banner has been uploaded successfully.",
                                });
                              } else {
                                setBannerUrl(uploadURL);
                                toast({
                                  title: "Banner Uploaded",
                                  description: "Banner uploaded, but path normalization failed.",
                                  variant: "destructive"
                                });
                              }
                            } catch (error) {
                              console.error('[BANNER-UPLOAD] Error processing banner:', error);
                              setBannerUrl(uploadURL);
                              toast({
                                title: "Upload Warning",
                                description: "Image uploaded but processing failed. Please save to apply changes.",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        buttonClassName="text-sm h-8"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Banner
                      </ObjectUploader>
                    </div>
                  </div>
                </div>

                {/* Avatar Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shop Avatar</label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{seller?.shopName?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Avatar image URL"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-64"
                        data-testid="input-avatar-url"
                      />
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880}
                        allowedFileTypes={['image/*']}
                        onGetUploadParameters={async () => {
                          console.log('[UPLOAD-DEBUG] Making request to /api/objects/upload');
                          try {
                            const res = await apiRequest("POST", "/api/objects/upload");
                            const response = await res.json();
                            console.log('[UPLOAD-DEBUG] Response from server:', response);
                            
                            if (!response) {
                              throw new Error('No response received from server');
                            }
                            
                            if (!response.uploadURL) {
                              throw new Error('Server did not return uploadURL');
                            }
                            
                            return {
                              method: "PUT" as const,
                              url: response.uploadURL,
                            };
                          } catch (error) {
                            console.error('[UPLOAD-DEBUG] Error in onGetUploadParameters:', error);
                            throw error;
                          }
                        }}
                        onComplete={async (result) => {
                          if (result.successful && result.successful[0]) {
                            const uploadURL = result.successful[0].uploadURL;
                            console.log('[AVATAR-UPLOAD] Upload completed, processing:', uploadURL);
                            
                            try {
                              // Process the uploaded image URL
                              const res = await apiRequest("PUT", "/api/seller/images", {
                                avatarImageURL: uploadURL
                              });
                              const response = await res.json();
                              
                              if (response.success && response.avatarPath) {
                                setAvatarUrl(response.avatarPath);
                                console.log('[AVATAR-UPLOAD] Avatar path normalized:', response.avatarPath);
                                toast({
                                  title: "Avatar Uploaded",
                                  description: "Your shop avatar has been uploaded successfully.",
                                });
                              } else {
                                setAvatarUrl(uploadURL);
                                toast({
                                  title: "Avatar Uploaded",
                                  description: "Avatar uploaded, but path normalization failed.",
                                  variant: "destructive"
                                });
                              }
                            } catch (error) {
                              console.error('[AVATAR-UPLOAD] Error processing avatar:', error);
                              setAvatarUrl(uploadURL);
                              toast({
                                title: "Upload Warning",
                                description: "Image uploaded but processing failed. Please save to apply changes.",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        buttonClassName="text-sm h-8"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Avatar
                      </ObjectUploader>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-shop-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, State" data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell customers about your shop and what makes it special..."
                        rows={4}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Policies */}
              <div className="space-y-4">
                <h4 className="font-medium">Shop Policies</h4>
                
                <FormField
                  control={profileForm.control}
                  name="policies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Policies</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your shop policies, terms of service, etc..."
                          rows={3}
                          data-testid="input-policies"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="shippingInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Shipping costs, processing times, international shipping, etc..."
                          rows={3}
                          data-testid="input-shipping"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="returnPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return & Refund Policy</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Return policy, refund conditions, exchanges, etc..."
                          rows={3}
                          data-testid="input-return-policy"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(false)}
                  data-testid="button-cancel-profile"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="bg-gothic-red hover:bg-gothic-red/80"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-serif font-bold">Shop Profile</h2>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                data-testid="button-preview-shop"
              >
                <Eye className="mr-2" size={16} />
                Preview Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Shop Page Preview</DialogTitle>
                <DialogDescription>
                  This is how your shop will appear to customers
                </DialogDescription>
              </DialogHeader>
              <div className="-m-6">
                <ShopPage
                  isPreview={true}
                  previewData={{
                    shopName: profileForm.watch("shopName") || seller?.shopName,
                    bio: profileForm.watch("bio") || seller?.bio,
                    location: profileForm.watch("location") || seller?.location,
                    policies: profileForm.watch("policies") || seller?.policies,
                    shippingInfo: profileForm.watch("shippingInfo") || seller?.shippingInfo,
                    returnPolicy: profileForm.watch("returnPolicy") || seller?.returnPolicy,
                    bannerImageUrl: bannerUrl || seller?.bannerImageUrl,
                    avatarImageUrl: avatarUrl || seller?.avatarImageUrl,
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Link to={`/shop/${seller?.id}`} target="_blank">
            <Button 
              variant="outline"
              data-testid="button-view-live-shop"
            >
              <Eye className="mr-2" size={16} />
              View Live Shop
            </Button>
          </Link>
          <Button 
            onClick={() => setIsEditingProfile(true)}
            className="bg-gothic-red hover:bg-gothic-red/80"
            data-testid="button-edit-profile"
          >
            <Edit className="mr-2" size={16} />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Shop Header */}
      <Card className="glass-effect" data-testid="shop-profile-display">
        {bannerUrl && (
          <div className="h-32 bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${bannerUrl})` }} />
        )}
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-4 border-background">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">{seller?.shopName?.[0] || 'S'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-serif text-2xl">{seller?.shopName || 'Shop Name'}</CardTitle>
              {seller?.location && (
                <p className="text-foreground/60 mt-1" data-testid="shop-location-display">
                  📍 {seller.location}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {seller?.bio && (
            <div>
              <h4 className="font-medium mb-2">About This Shop</h4>
              <p className="text-foreground/80 leading-relaxed" data-testid="shop-bio-display">
                {seller.bio}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seller?.policies && (
              <div>
                <h4 className="font-medium mb-2">Shop Policies</h4>
                <p className="text-foreground/70 text-sm leading-relaxed" data-testid="shop-policies-display">
                  {seller.policies}
                </p>
              </div>
            )}

            {seller?.shippingInfo && (
              <div>
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <p className="text-foreground/70 text-sm leading-relaxed" data-testid="shop-shipping-display">
                  {seller.shippingInfo}
                </p>
              </div>
            )}

            {seller?.returnPolicy && (
              <div>
                <h4 className="font-medium mb-2">Return Policy</h4>
                <p className="text-foreground/70 text-sm leading-relaxed" data-testid="shop-return-display">
                  {seller.returnPolicy}
                </p>
              </div>
            )}
          </div>

          {(!seller?.policies && !seller?.shippingInfo && !seller?.returnPolicy) && (
            <div className="text-center py-8 text-foreground/60">
              <p>Complete your shop profile to help customers learn more about your business.</p>
              <Button 
                onClick={() => setIsEditingProfile(true)}
                variant="outline"
                className="mt-4"
                data-testid="button-complete-profile"
              >
                Complete Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Promotions List Component
function PromotionsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["/api/seller/promotions"],
  });

  const updatePromotionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertPromotion> }) => {
      return apiRequest("PUT", `/api/promotions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/promotions"] });
      toast({
        title: "Promotion Updated",
        description: "Your promotion has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePromotionStatus = (promotion: Promotion) => {
    updatePromotionMutation.mutate({
      id: promotion.id,
      updates: { isActive: !promotion.isActive },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if ((promotions as any)?.length === 0) {
    return (
      <Card className="glass-effect" data-testid="no-promotions">
        <CardContent className="p-12 text-center">
          <Tag className="mx-auto mb-4 text-foreground/40" size={48} />
          <h3 className="text-xl font-serif font-bold mb-2">No Promotions Yet</h3>
          <p className="text-foreground/70 mb-4">
            Create discount codes and promotions to boost your sales and attract more customers.
          </p>
          <PromotionDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/seller/promotions"] })} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="promotions-list">
      {(promotions as any)?.map((promotion: Promotion) => (
        <Card key={promotion.id} className="glass-effect" data-testid={`promotion-${promotion.id}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-serif font-bold" data-testid={`promotion-name-${promotion.id}`}>
                    {promotion.name}
                  </h3>
                  <Badge
                    variant={promotion.isActive ? "default" : "secondary"}
                    data-testid={`promotion-status-${promotion.id}`}
                  >
                    {promotion.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {promotion.discountType === "percentage" && (
                    <Badge variant="outline" className="bg-gothic-purple/10 text-gothic-purple">
                      <Percent className="h-3 w-3 mr-1" />
                      {promotion.discountValue}% Off
                    </Badge>
                  )}
                  {promotion.discountType === "fixed_amount" && (
                    <Badge variant="outline" className="bg-gothic-red/10 text-gothic-red">
                      ${promotion.discountValue} Off
                    </Badge>
                  )}
                  {promotion.discountType === "free_shipping" && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Free Shipping
                    </Badge>
                  )}
                </div>
                
                {promotion.description && (
                  <p className="text-foreground/70 text-sm mb-2" data-testid={`promotion-description-${promotion.id}`}>
                    {promotion.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  <span>
                    {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                  </span>
                  {promotion.maxUses && (
                    <span data-testid={`promotion-usage-${promotion.id}`}>
                      Used: {promotion.currentUses || 0}/{promotion.maxUses}
                    </span>
                  )}
                  {promotion.minPurchase && parseFloat(promotion.minPurchase) > 0 && (
                    <span>Min: ${promotion.minPurchase}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePromotionStatus(promotion)}
                  disabled={updatePromotionMutation.isPending}
                  data-testid={`button-toggle-${promotion.id}`}
                >
                  {promotion.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`button-edit-promotion-${promotion.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
