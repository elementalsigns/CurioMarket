import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Eye, Star, Calendar } from "lucide-react";

interface AnalyticsData {
  date: string;
  views: number;
  sales: number;
  revenue: number;
  newFavorites: number;
  newFollowers: number;
}

interface EarningsData {
  totalEarnings: number;
  totalOrders: number;
  averageOrder: number;
}

export default function SellerAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  // Fetch analytics data
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/seller/analytics', dateRange.start, dateRange.end],
    queryFn: () => fetch(`/api/seller/analytics?startDate=${dateRange.start}&endDate=${dateRange.end}`)
      .then(res => res.json()),
  });

  // Fetch earnings data
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/seller/earnings', timePeriod],
    queryFn: () => fetch(`/api/seller/earnings?period=${timePeriod}`)
      .then(res => res.json()),
  }) as { data: EarningsData | undefined; isLoading: boolean };

  // Fetch promotions
  const { data: promotions = [], isLoading: promotionsLoading } = useQuery({
    queryKey: ['/api/seller/promotions'],
  });

  // Calculate summary metrics
  const summaryMetrics = analytics.reduce((acc: any, day: AnalyticsData) => ({
    totalViews: acc.totalViews + day.views,
    totalSales: acc.totalSales + day.sales,
    totalRevenue: acc.totalRevenue + parseFloat(day.revenue.toString()),
    totalFavorites: acc.totalFavorites + day.newFavorites,
    totalFollowers: acc.totalFollowers + day.newFollowers,
  }), {
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalFavorites: 0,
    totalFollowers: 0,
  });

  // Chart colors
  const COLORS = ['#dc2626', '#7c2d12', '#991b1b', '#b91c1c'];

  const updateDateRange = (period: 'week' | 'month' | 'year') => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
      case 'year':
        start.setDate(end.getDate() - 365);
        break;
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    setTimePeriod(period);
  };

  if (analyticsLoading || earningsLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Analytics</h1>
            <p className="text-zinc-400">Track your shop's performance and growth</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timePeriod} onValueChange={updateDateRange}>
              <SelectTrigger data-testid="select-time-period" className="w-32 bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-total-revenue">
                    ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-orders">
                    {earnings?.totalOrders || 0}
                  </p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-blue-500">+8.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Average Order</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-average-order">
                    ${earnings?.averageOrder?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-purple-500 mr-1" />
                <span className="text-purple-500">+5.1% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-views">
                    {summaryMetrics.totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-orange-500 mr-1" />
                <span className="text-orange-500">+15.3% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">New Followers</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-new-followers">
                    {summaryMetrics.totalFollowers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-red-500 mr-1" />
                <span className="text-red-500">+22.7% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue Over Time</CardTitle>
              <CardDescription className="text-zinc-400">
                Daily revenue for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Views and Sales Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Views & Sales</CardTitle>
              <CardDescription className="text-zinc-400">
                Daily views and sales comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Bar dataKey="views" fill="#f97316" name="Views" />
                  <Bar dataKey="sales" fill="#dc2626" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Promotions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Active Promotions</CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage your current promotional campaigns
                </CardDescription>
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-create-promotion"
              >
                Create Promotion
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {promotionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            ) : promotions.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No Active Promotions</h3>
                <p className="text-zinc-400 mb-4">Create promotions to boost your sales</p>
              </div>
            ) : (
              <div className="space-y-4">
                {promotions.map((promotion: any) => (
                  <div 
                    key={promotion.id}
                    className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                    data-testid={`promotion-${promotion.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-semibold">{promotion.name}</h4>
                        <Badge 
                          variant={promotion.isActive ? "default" : "secondary"}
                          className={promotion.isActive ? "bg-green-600" : "bg-zinc-600"}
                        >
                          {promotion.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-zinc-400 text-sm mb-2">{promotion.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-red-400">
                          {promotion.discountType === 'percentage' ? `${promotion.discountValue}% off` : 
                           promotion.discountType === 'fixed_amount' ? `$${promotion.discountValue} off` :
                           'Free shipping'}
                        </span>
                        <span className="text-zinc-400">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-zinc-400">
                          Uses: {promotion.currentUses}/{promotion.maxUses || '∞'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                        {promotion.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}