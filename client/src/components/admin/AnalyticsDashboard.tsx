import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Store, DollarSign, ShoppingCart, Calendar, Activity, Download, RefreshCw, Loader2 } from "lucide-react";

interface PlatformStats {
  users: {
    total: number;
    buyers: number;
    sellers: number;
    admins: number;
    newThisMonth: number;
    growthRate: number;
  };
  shops: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    newThisMonth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    pending: number;
    shipped: number;
    delivered: number;
    refunded: number;
    totalRevenue: string;
    monthlyRevenue: string;
  };
  listings: {
    total: number;
    published: number;
    draft: number;
    suspended: number;
    flagged: number;
    newThisMonth: number;
  };
  disputes: {
    total: number;
    open: number;
    resolved: number;
    thisMonth: number;
  };
  revenue: {
    total: string;
    platformFees: string;
    thisMonth: string;
    lastMonth: string;
    growthRate: number;
  };
  activity: {
    date: string;
    newUsers: number;
    newOrders: number;
    newListings: number;
  }[];
}

interface ExportStats {
  totalProducts: number;
  lastExported: string;
  exportFormats: string[];
}

const timeRangeOptions = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" }
];

const formatCurrency = (amount: string) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatPercentage = (rate: number) => {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
};

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch platform statistics
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/stats', { timeRange }],
    staleTime: 60000, // 1 minute
  });

  // Fetch export statistics  
  const { data: exportData, isLoading: exportLoading } = useQuery<ExportStats>({
    queryKey: ['/api/admin/export/stats'],
    staleTime: 300000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const handleExport = async (format: string) => {
    try {
      const response = await apiRequest('GET', `/api/admin/export/products?format=${format}`);
      // Handle export download
      console.log(`Exporting data in ${format} format`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (statsError) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading analytics</p>
            <p className="text-sm">{statsError instanceof Error ? statsError.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-muted-foreground">Monitor platform performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48" data-testid="select-time-range">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="commerce" data-testid="tab-commerce">Commerce</TabsTrigger>
            <TabsTrigger value="export" data-testid="tab-export">Data Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-users">
                    {formatNumber(statsData?.users.total || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span className={statsData?.users.growthRate && statsData.users.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(statsData?.users.growthRate || 0)}
                    </span>
                    <span>this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-active-shops">
                    {formatNumber(statsData?.shops.active || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsData?.shops.newThisMonth || 0} new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-monthly-revenue">
                    {formatCurrency(statsData?.revenue.thisMonth || "0")}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span className={statsData?.revenue.growthRate && statsData.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(statsData?.revenue.growthRate || 0)}
                    </span>
                    <span>vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-orders">
                    {formatNumber(statsData?.orders.total || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(statsData?.orders.thisMonth || 0)} this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">User Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Buyers</span>
                        <span className="text-sm font-medium">{formatNumber(statsData?.users.buyers || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sellers</span>
                        <span className="text-sm font-medium">{formatNumber(statsData?.users.sellers || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Admins</span>
                        <span className="text-sm font-medium">{formatNumber(statsData?.users.admins || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Order Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Pending</span>
                        <Badge variant="outline">{formatNumber(statsData?.orders.pending || 0)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Shipped</span>
                        <Badge variant="outline">{formatNumber(statsData?.orders.shipped || 0)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Delivered</span>
                        <Badge variant="outline">{formatNumber(statsData?.orders.delivered || 0)}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Content Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Published Listings</span>
                        <span className="text-sm font-medium">{formatNumber(statsData?.listings.published || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Flagged Content</span>
                        <Badge variant={statsData?.listings.flagged ? "destructive" : "outline"}>
                          {formatNumber(statsData?.listings.flagged || 0)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Open Disputes</span>
                        <Badge variant={statsData?.disputes.open ? "destructive" : "outline"}>
                          {formatNumber(statsData?.disputes.open || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Users This Month</span>
                      <span className="text-2xl font-bold">{formatNumber(statsData?.users.newThisMonth || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Growth Rate</span>
                      <span className={`text-sm font-medium ${statsData?.users.growthRate && statsData.users.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(statsData?.users.growthRate || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Buyers</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${((statsData?.users.buyers || 0) / (statsData?.users.total || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{formatNumber(statsData?.users.buyers || 0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sellers</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${((statsData?.users.sellers || 0) / (statsData?.users.total || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{formatNumber(statsData?.users.sellers || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commerce" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Platform revenue and fees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-xl font-bold">{formatCurrency(statsData?.revenue.total || "0")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Platform Fees</span>
                      <span className="text-lg font-medium">{formatCurrency(statsData?.revenue.platformFees || "0")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-lg font-medium">{formatCurrency(statsData?.revenue.thisMonth || "0")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Month</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(statsData?.revenue.lastMonth || "0")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shop Performance</CardTitle>
                  <CardDescription>Shop status and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Shops</span>
                      <span className="text-xl font-bold">{formatNumber(statsData?.shops.total || 0)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active</span>
                        <Badge className="bg-green-100 text-green-800">
                          {formatNumber(statsData?.shops.active || 0)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Suspended</span>
                        <Badge className="bg-red-100 text-red-800">
                          {formatNumber(statsData?.shops.suspended || 0)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Approval</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {formatNumber(statsData?.shops.pending || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </CardTitle>
                <CardDescription>
                  Export platform data for analysis and reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exportLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading export options...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Total Products</label>
                        <p className="text-2xl font-bold">{formatNumber(exportData?.totalProducts || 0)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Export</label>
                        <p className="text-sm text-muted-foreground">
                          {exportData?.lastExported ? new Date(exportData.lastExported).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Available Export Formats</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {exportData?.exportFormats?.map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport(format)}
                            data-testid={`button-export-${format.toLowerCase()}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {format.toUpperCase()}
                          </Button>
                        )) || (
                          ['CSV', 'Excel', 'JSON'].map((format) => (
                            <Button
                              key={format}
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(format.toLowerCase())}
                              data-testid={`button-export-${format.toLowerCase()}`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {format}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}