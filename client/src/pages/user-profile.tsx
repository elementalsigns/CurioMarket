import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { User, Settings, Heart, ShoppingBag, Star, Package, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useEffect } from "react";

export default function UserProfile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const { data: favorites } = useQuery({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
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

  const removeFavoriteMutation = useMutation({
    mutationFn: (listingId: string) => apiRequest("DELETE", `/api/favorites/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Please Sign In</h1>
          <p className="text-xl text-foreground/70 mb-8">
            You need to be signed in to view your profile.
          </p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="user-profile">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6" data-testid="profile-header">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                  <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                    {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-serif font-bold mb-2" data-testid="user-name">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email?.split('@')[0]
                    }
                  </h1>
                  <p className="text-foreground/70 mb-3" data-testid="user-email">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" data-testid="user-role">
                      {user.role === 'seller' ? 'Seller' : 'Collector'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-foreground/60">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="profile-tabs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2" data-testid="tab-favorites">
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
                <ShoppingBag className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="profile-form">
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" disabled data-testid="input-email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Your Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!favorites || favorites.length === 0 ? (
                    <div className="text-center py-12" data-testid="favorites-empty">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                      <p className="text-foreground/70">
                        Start browsing and save items you love to see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="favorites-grid">
                      {favorites.map((favorite: any) => (
                        <ProductCard
                          key={favorite.listing.id}
                          listing={favorite.listing}
                          onRemoveFavorite={() => removeFavoriteMutation.mutate(favorite.listing.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!orders || orders.length === 0 ? (
                    <div className="text-center py-12" data-testid="orders-empty">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                      <p className="text-foreground/70">
                        Your purchase history will appear here once you make your first order.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="orders-list">
                      {orders.map((order: any) => (
                        <Card key={order.id} data-testid={`order-${order.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                                <p className="text-sm text-foreground/70">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge 
                                variant={order.status === 'fulfilled' ? 'default' : 'secondary'}
                                data-testid={`order-status-${order.id}`}
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">${order.total}</span>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.role !== 'seller' && (
                    <div className="p-4 border border-border rounded-lg" data-testid="seller-upgrade">
                      <h4 className="font-semibold mb-2">Become a Seller</h4>
                      <p className="text-sm text-foreground/70 mb-4">
                        Start selling your oddities and curiosities on Curio Market.
                      </p>
                      <Button>
                        Start Selling
                      </Button>
                    </div>
                  )}
                  
                  <div className="p-4 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive" disabled>
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}