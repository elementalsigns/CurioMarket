import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  DollarSign, 
  Package, 
  Users, 
  Star,
  ShoppingCart,
  MessageCircle
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts";

interface AnalyticsProps {
  sellerId: string;
  dateRange?: string;
}

export default function SellerAnalytics({ sellerId, dateRange = "30d" }: AnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/seller/analytics", sellerId, dateRange],
  });

  const { data: topProducts } = useQuery({
    queryKey: ["/api/seller/analytics/top-products", sellerId, dateRange],
  });

  const { data: trafficSources } = useQuery({
    queryKey: ["/api/seller/analytics/traffic", sellerId, dateRange],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="glass-effect animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-zinc-700 rounded mb-2"></div>
              <div className="h-8 bg-zinc-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = analytics?.overview || {};
  const chartData = analytics?.chartData || [];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{stats.views?.toLocaleString() || 0}</p>
                <div className="flex items-center text-sm mt-1">
                  {stats.viewsChange >= 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={stats.viewsChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stats.viewsChange || 0)}%
                  </span>
                </div>
              </div>
              <Eye className="text-zinc-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.revenue?.toLocaleString() || 0}</p>
                <div className="flex items-center text-sm mt-1">
                  {stats.revenueChange >= 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stats.revenueChange || 0)}%
                  </span>
                </div>
              </div>
              <DollarSign className="text-zinc-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Orders</p>
                <p className="text-2xl font-bold text-white">{stats.orders || 0}</p>
                <div className="flex items-center text-sm mt-1">
                  {stats.ordersChange >= 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={stats.ordersChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stats.ordersChange || 0)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="text-zinc-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">{stats.conversionRate || 0}%</p>
                <div className="flex items-center text-sm mt-1">
                  {stats.conversionChange >= 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={stats.conversionChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stats.conversionChange || 0)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="text-zinc-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
          <TabsTrigger value="overview" className="text-zinc-300 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="products" className="text-zinc-300 data-[state=active]:text-white">Products</TabsTrigger>
          <TabsTrigger value="traffic" className="text-zinc-300 data-[state=active]:text-white">Traffic</TabsTrigger>
          <TabsTrigger value="customers" className="text-zinc-300 data-[state=active]:text-white">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#71717a"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#71717a"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ fill: '#dc2626' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Views Chart */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Views Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#71717a"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#71717a"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Shop Performance</h3>
                  <Star className="text-yellow-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Average Rating</span>
                    <span className="text-white font-medium">{stats.averageRating || 0}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Reviews</span>
                    <span className="text-white font-medium">{stats.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Response Rate</span>
                    <span className="text-white font-medium">{stats.responseRate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Engagement</h3>
                  <Heart className="text-red-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Favorites</span>
                    <span className="text-white font-medium">{stats.favorites || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Followers</span>
                    <span className="text-white font-medium">{stats.followers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Repeat Customers</span>
                    <span className="text-white font-medium">{stats.repeatCustomers || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Inventory</h3>
                  <Package className="text-blue-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Listings</span>
                    <span className="text-white font-medium">{stats.activeListings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Low Stock Items</span>
                    <span className="text-yellow-500 font-medium">{stats.lowStockItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Out of Stock</span>
                    <span className="text-red-500 font-medium">{stats.outOfStockItems || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts?.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 border border-zinc-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="bg-zinc-800">
                        #{index + 1}
                      </Badge>
                    </div>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{product.title}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-zinc-400">Views: </span>
                          <span className="text-white">{product.views}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Sales: </span>
                          <span className="text-white">{product.sales}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Revenue: </span>
                          <span className="text-white">${product.revenue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources?.map((source: any) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">{source.name}</span>
                        <span className="text-white">{source.percentage}%</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Search Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topKeywords?.map((keyword: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-zinc-300">{keyword.term}</span>
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                        {keyword.count} searches
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Demographics</h4>
                  <div className="space-y-4">
                    {analytics?.demographics?.map((demo: any) => (
                      <div key={demo.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{demo.category}</span>
                          <span className="text-white">{demo.percentage}%</span>
                        </div>
                        <Progress value={demo.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Top Customers</h4>
                  <div className="space-y-3">
                    {analytics?.topCustomers?.map((customer: any) => (
                      <div key={customer.id} className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{customer.name}</p>
                          <p className="text-zinc-400 text-sm">{customer.orders} orders</p>
                        </div>
                        <span className="text-white font-medium">${customer.totalSpent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}