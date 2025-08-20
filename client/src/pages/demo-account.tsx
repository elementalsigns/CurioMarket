import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Star, 
  Package, 
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Store,
  BarChart3,
  Plus,
  Edit3,
  Eye,
  TrendingUp,
  DollarSign,
  MessageSquare
} from "lucide-react";

export default function DemoAccount() {
  const [demoMode, setDemoMode] = useState<"buyer" | "seller">("buyer");
  const [activeTab, setActiveTab] = useState("overview");

  const mockUser = {
    firstName: "Jane",
    lastName: "Collector", 
    email: "jane@example.com",
    profileImageUrl: ""
  };

  const isSeller = demoMode === "seller";

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(212, 5%, 5%)', color: 'white'}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Demo Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
            <Button 
              variant={demoMode === "buyer" ? "default" : "ghost"}
              onClick={() => setDemoMode("buyer")}
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              Buyer View
            </Button>
            <Button 
              variant={demoMode === "seller" ? "default" : "ghost"}
              onClick={() => setDemoMode("seller")}
              className={demoMode === "seller" ? "bg-red-900 hover:bg-red-800 text-white" : ""}
            >
              Seller View
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 space-y-2">
            <div className="bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-700">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={mockUser.profileImageUrl || ""} />
                  <AvatarFallback className="bg-zinc-700 text-white">JC</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-white">{mockUser.firstName} {mockUser.lastName}</h2>
                  <p className="text-zinc-400">{mockUser.email}</p>
                  {isSeller && <Badge className="mt-1 bg-red-900 text-white">Seller</Badge>}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "overview" 
                    ? "bg-red-900 hover:bg-red-800 text-white" 
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {isSeller ? "Shop Overview" : "Account Overview"}
              </Button>

              {isSeller && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => setActiveTab("listings")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Your Listings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => setActiveTab("orders-seller")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Orders
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => setActiveTab("shop-stats")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Shop Stats
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => setActiveTab("purchases")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Your Purchases
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => setActiveTab("favorites")}
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => setActiveTab("billing")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isSeller ? "Billing & Payouts" : "Payment Methods"}
              </Button>

              {!isSeller && (
                <div className="pt-4 border-t border-zinc-700">
                  <Button className="w-full bg-red-900 hover:bg-red-800 text-white">
                    <Store className="mr-2 h-4 w-4" />
                    Become a Seller
                  </Button>
                </div>
              )}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">{isSeller ? "Shop Manager" : "Your Account"}</h1>
                <p className="text-zinc-400 mt-2">
                  {isSeller ? "Manage your shop, listings, and sales" : "Manage your account settings and purchases"}
                </p>
              </div>

              {/* Overview Content */}
              <div className="space-y-6">
                {isSeller ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Total Listings</p>
                              <p className="text-2xl font-bold text-white">12</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Total Sales</p>
                              <p className="text-2xl font-bold text-white">47</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Revenue</p>
                              <p className="text-2xl font-bold text-white">$1,234</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Avg Rating</p>
                              <p className="text-2xl font-bold text-white">4.8</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-white">
                            <TrendingUp className="mr-2" />
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-zinc-300">New order received</span>
                              <span className="text-xs text-zinc-400">2 hours ago</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-zinc-300">Listing viewed 15 times</span>
                              <span className="text-xs text-zinc-400">1 day ago</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-zinc-300">New follower</span>
                              <span className="text-xs text-zinc-400">3 days ago</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-white">
                            <Plus className="mr-2" />
                            Quick Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full bg-red-900 hover:bg-red-800 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Listing
                          </Button>
                          <Button variant="outline" className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700">
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
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Orders</p>
                              <p className="text-2xl font-bold text-white">8</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Favorites</p>
                              <p className="text-2xl font-bold text-white">23</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-zinc-400" />
                            <div>
                              <p className="text-sm font-medium text-zinc-300">Member Since</p>
                              <p className="text-sm font-bold text-white">2024</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <Card className="bg-zinc-900 border-zinc-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-white">
                            <Store className="mr-2" />
                            Interested in Selling?
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-zinc-400 mb-4">
                            Turn your passion for oddities into income. Join our community of collectors and sellers.
                          </p>
                          <Button className="bg-red-900 hover:bg-red-800 text-white">
                            Learn About Selling
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}