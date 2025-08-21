import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Store, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Bell, 
  Settings, 
  Plus,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  Star,
  Search,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SellerAnalytics from "./seller-analytics";

export default function EnhancedSellerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [promotionModal, setPromotionModal] = useState(false);

  // Get seller data and stats
  const { data: sellerData } = useQuery({
    queryKey: ["/api/seller/profile"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/seller/dashboard/stats"],
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ["/api/seller/inventory/low-stock"],
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/seller/orders/recent"],
  });

  const { data: pendingMessages } = useQuery({
    queryKey: ["/api/seller/messages/pending"],
  });

  const { data: promotions } = useQuery({
    queryKey: ["/api/seller/promotions"],
  });

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      return await apiRequest("POST", "/api/seller/promotions", promotionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/promotions"] });
      toast({
        title: "Promotion created",
        description: "Your promotion is now active",
      });
      setPromotionModal(false);
    },
  });

  const stats = dashboardStats || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Seller Dashboard</h1>
          <p className="text-zinc-400">Welcome back, {sellerData?.shopName || "Seller"}!</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
          >
            <Settings size={16} className="mr-2" />
            Shop Settings
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.location.href = "/seller/listings/create"}
          >
            <Plus size={16} className="mr-2" />
            New Listing
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Today's Sales</p>
                <p className="text-2xl font-bold text-white">${stats.todaySales?.toFixed(2) || "0.00"}</p>
                <p className="text-xs text-green-500">+{stats.todayGrowth || 0}% vs yesterday</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Pending Orders</p>
                <p className="text-2xl font-bold text-white">{stats.pendingOrders || 0}</p>
                <p className="text-xs text-yellow-500">Needs attention</p>
              </div>
              <ShoppingCart className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{stats.totalViews?.toLocaleString() || 0}</p>
                <p className="text-xs text-blue-500">Last 30 days</p>
              </div>
              <Eye className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Shop Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating?.toFixed(1) || "0.0"}</p>
                <div className="flex items-center text-xs text-yellow-500">
                  <Star size={12} className="mr-1 fill-current" />
                  {stats.totalReviews || 0} reviews
                </div>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-zinc-800">
          <TabsTrigger value="overview" className="text-zinc-300 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-zinc-300 data-[state=active]:text-white">
            Orders
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-zinc-300 data-[state=active]:text-white">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="promotions" className="text-zinc-300 data-[state=active]:text-white">
            Promotions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-zinc-300 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-zinc-300 data-[state=active]:text-white">
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Recent Orders</span>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders?.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-zinc-400 text-sm">{order.buyerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${order.total}</p>
                          <Badge variant={
                            order.status === "pending" ? "secondary" :
                            order.status === "processing" ? "default" :
                            order.status === "shipped" ? "outline" : "secondary"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts & Notifications */}
            <div>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems?.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-400 font-medium">Low Stock Alert</p>
                        <p className="text-zinc-300 text-sm">{lowStockItems.length} items need restocking</p>
                      </div>
                    )}
                    
                    {pendingMessages?.length > 0 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 font-medium">New Messages</p>
                        <p className="text-zinc-300 text-sm">{pendingMessages.length} unread customer messages</p>
                      </div>
                    )}

                    {stats.pendingOrders > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 font-medium">Orders Waiting</p>
                        <p className="text-zinc-300 text-sm">{stats.pendingOrders} orders need processing</p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                    >
                      <Bell size={16} className="mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input 
                    placeholder="Search orders..." 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button variant="outline" className="text-zinc-300 border-zinc-600">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentOrders?.map((order: any) => (
                  <div key={order.id} className="p-4 border border-zinc-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">Order #{order.id.slice(0, 8)}</h4>
                        <p className="text-zinc-400 text-sm">{order.createdAt}</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-400">Customer: </span>
                        <span className="text-white">{order.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Items: </span>
                        <span className="text-white">{order.itemCount}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Total: </span>
                        <span className="text-white">${order.total}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="text-zinc-300 border-zinc-600">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white">Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="text-center p-4 border border-zinc-700 rounded-lg">
                      <p className="text-2xl font-bold text-white">{stats.totalProducts || 0}</p>
                      <p className="text-zinc-400 text-sm">Total Products</p>
                    </div>
                    <div className="text-center p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/10">
                      <p className="text-2xl font-bold text-yellow-400">{stats.lowStockCount || 0}</p>
                      <p className="text-zinc-400 text-sm">Low Stock</p>
                    </div>
                    <div className="text-center p-4 border border-red-500/20 rounded-lg bg-red-500/10">
                      <p className="text-2xl font-bold text-red-400">{stats.outOfStockCount || 0}</p>
                      <p className="text-zinc-400 text-sm">Out of Stock</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Products Needing Attention</h4>
                    {lowStockItems?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-medium">{item.title}</p>
                            <p className="text-zinc-400 text-sm">SKU: {item.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-medium">{item.quantity} left</p>
                          <Button size="sm" variant="outline" className="mt-2 text-zinc-300 border-zinc-600">
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Plus size={16} className="mr-2" />
                    Add New Product
                  </Button>
                  <Button variant="outline" className="w-full text-zinc-300 border-zinc-600">
                    <Package size={16} className="mr-2" />
                    Bulk Edit Inventory
                  </Button>
                  <Button variant="outline" className="w-full text-zinc-300 border-zinc-600">
                    <TrendingUp size={16} className="mr-2" />
                    Export Inventory
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Active Promotions</h3>
            <Button 
              onClick={() => setPromotionModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus size={16} className="mr-2" />
              Create Promotion
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {promotions?.map((promo: any) => (
              <Card key={promo.id} className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">{promo.name}</h4>
                    <Badge variant={promo.isActive ? "default" : "secondary"}>
                      {promo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Discount:</span>
                      <span className="text-white">
                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Uses:</span>
                      <span className="text-white">{promo.currentUses} / {promo.maxUses || "∞"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ends:</span>
                      <span className="text-white">{new Date(promo.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress 
                      value={promo.maxUses ? (promo.currentUses / promo.maxUses) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 text-zinc-300 border-zinc-600">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-zinc-300 border-zinc-600">
                      View Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <SellerAnalytics sellerId={sellerData?.id || ""} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Customer Messages</span>
                <Badge variant="secondary" className="bg-red-600 text-white">
                  {pendingMessages?.length || 0} unread
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMessages?.map((message: any) => (
                  <div key={message.id} className="p-4 border border-zinc-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                          <Users size={18} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{message.senderName}</p>
                          <p className="text-zinc-400 text-sm">{message.createdAt}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-red-600 text-red-400">
                        New
                      </Badge>
                    </div>
                    
                    <p className="text-zinc-300 mb-3">{message.content}</p>
                    
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <MessageSquare size={14} className="mr-2" />
                      Reply
                    </Button>
                  </div>
                ))}

                {(!pendingMessages || pendingMessages.length === 0) && (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No new messages</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}