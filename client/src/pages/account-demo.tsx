import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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

export default function AccountDemo() {
  const [demoMode, setDemoMode] = useState<"buyer" | "seller">("buyer");
  const [activeTab, setActiveTab] = useState("overview");

  const mockUser = {
    firstName: "Jane",
    lastName: "Collector", 
    email: "jane@example.com",
    profileImageUrl: ""
  };

  const isSeller = demoMode === "seller";
  const pageTitle = isSeller ? "Shop Manager" : "Your Account";

  return (
    <div className="min-h-screen bg-background" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Demo Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 p-1 bg-card rounded-lg">
            <Button 
              variant={demoMode === "buyer" ? "default" : "ghost"}
              onClick={() => setDemoMode("buyer")}
            >
              Buyer View
            </Button>
            <Button 
              variant={demoMode === "seller" ? "default" : "ghost"}
              onClick={() => setDemoMode("seller")}
            >
              Seller View
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 space-y-2">
            <div className="bg-card rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={mockUser.profileImageUrl || ""} />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{mockUser.firstName} {mockUser.lastName}</h2>
                  <p className="text-muted-foreground">{mockUser.email}</p>
                  {isSeller && <Badge className="mt-1 bg-red-900">Seller</Badge>}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
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
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Your Listings
                  </Button>
                  <Button
                    variant={activeTab === "orders-seller" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders-seller")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Orders
                  </Button>
                  <Button
                    variant={activeTab === "shop-stats" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("shop-stats")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Shop Stats
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messages")}
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
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Your Purchases
              </Button>

              <Button
                variant={activeTab === "favorites" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("favorites")}
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </Button>

              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>

              <Button
                variant={activeTab === "billing" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("billing")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isSeller ? "Billing & Payouts" : "Payment Methods"}
              </Button>

              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>

              <Button
                variant={activeTab === "privacy" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("privacy")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Privacy Settings
              </Button>

              {!isSeller && (
                <div className="pt-4 border-t">
                  <Button className="w-full bg-red-900 hover:bg-red-800">
                    <Store className="mr-2 h-4 w-4" />
                    Become a Seller
                  </Button>
                </div>
              )}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-card rounded-lg p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
                <p className="text-muted-foreground mt-2">
                  {isSeller ? "Manage your shop, listings, and sales" : "Manage your account settings and purchases"}
                </p>
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {isSeller ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Total Listings</p>
                                <p className="text-2xl font-bold">12</p>
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
                                <p className="text-2xl font-bold">47</p>
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
                                <p className="text-2xl font-bold">$1,234</p>
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
                                <p className="text-2xl font-bold">4.8</p>
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
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">New order received</span>
                                <span className="text-xs text-muted-foreground">2 hours ago</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Listing viewed 15 times</span>
                                <span className="text-xs text-muted-foreground">1 day ago</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">New follower</span>
                                <span className="text-xs text-muted-foreground">3 days ago</span>
                              </div>
                            </div>
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
                            <Button className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Listing
                            </Button>
                            <Button variant="outline" className="w-full">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Dashboard
                            </Button>
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
                                <p className="text-2xl font-bold">8</p>
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
                                <p className="text-2xl font-bold">23</p>
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
                                <p className="text-sm font-bold">2024</p>
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
                            <Button className="bg-red-900 hover:bg-red-800">
                              Learn About Selling
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sample Content for Other Tabs */}
              {activeTab === "listings" && isSeller && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Listings</h2>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Listing
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            <div className="w-16 h-16 bg-muted rounded"></div>
                            <div>
                              <h3 className="font-medium">Vintage Medical Skull Model</h3>
                              <p className="text-muted-foreground text-sm">Vintage Medical</p>
                              <Badge className="mt-1">Active</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$245.00</p>
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
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== "overview" && activeTab !== "listings" && (
                <div className="text-center py-12">
                  <h2 className="text-xl font-bold mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h2>
                  <p className="text-muted-foreground">This section would contain {activeTab} management features.</p>
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