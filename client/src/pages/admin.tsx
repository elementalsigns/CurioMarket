import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTable } from "@/components/admin/EventsTable";
import { ExpirationManager } from "@/components/admin/ExpirationManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { ShopManagement } from "@/components/admin/ShopManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { OrderDisputes } from "@/components/admin/OrderDisputes";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { SystemManagement } from "@/components/admin/SystemManagement";
import { Loader2, AlertTriangle, CheckCircle, Shield, Calendar, Database, Settings, Users, Store, Flag, Scale, BarChart3, Settings2 } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runCleanup = async () => {
    setIsRunning(true);
    setError("");
    setResult(null);

    try {
      const response = await apiRequest("POST", "/api/admin/cleanup-failed-orders");
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "Cleanup failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="shops" className="flex items-center gap-2" data-testid="tab-shops">
              <Store className="h-4 w-4" />
              Shops
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2" data-testid="tab-content">
              <Flag className="h-4 w-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2" data-testid="tab-disputes">
              <Scale className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2" data-testid="tab-events">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2" data-testid="tab-system">
              <Settings2 className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2" data-testid="tab-database">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-muted-foreground">
                Manage all users on the platform, track signups, and handle user moderation.
              </p>
            </div>
            <UserManagement />
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Shop Management</h2>
              <p className="text-muted-foreground">
                Manage seller shops, track performance, and handle shop verification and moderation.
              </p>
            </div>
            <ShopManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Content Moderation</h2>
              <p className="text-muted-foreground">
                Review flagged content, moderate user reports, and manage platform content standards.
              </p>
            </div>
            <ContentModeration />
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Order Disputes & Refunds</h2>
              <p className="text-muted-foreground">
                Handle buyer-seller disputes, process refunds, and manage order resolution.
              </p>
            </div>
            <OrderDisputes />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Event Management</h2>
              <p className="text-muted-foreground">
                Manage all events on the platform, moderate content, and control event status.
              </p>
            </div>
            <EventsTable />
            <div className="mt-8">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Auto-Expiration Management</h3>
                <p className="text-muted-foreground">
                  Configure and manage automatic expiration of old events to keep listings current.
                </p>
              </div>
              <ExpirationManager />
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">System Management</h2>
              <p className="text-muted-foreground">
                Manage platform settings, verification queue, and system administration.
              </p>
            </div>
            <SystemManagement />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Database Maintenance</h2>
              <p className="text-muted-foreground">
                System maintenance tools for cleaning up data and optimizing performance.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Cleanup
                </CardTitle>
                <CardDescription>
                  Clean up failed orders and restore inventory levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={runCleanup} 
                  disabled={isRunning}
                  className="w-full"
                  data-testid="button-run-cleanup"
                >
                  {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isRunning ? "Running Cleanup..." : "Run Database Cleanup"}
                </Button>

                {error && (
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="font-medium">Error: {error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result && (
                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <p className="font-medium">Cleanup Completed Successfully!</p>
                        </div>
                        
                        <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                          <p><strong>Orders Removed:</strong> {result.stats.ordersRemoved}</p>
                          <p><strong>Inventory Restored:</strong> {result.stats.inventoryRestored} units</p>
                          <p><strong>Failed Orders Found:</strong> {result.stats.failedOrdersFound}</p>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-100 rounded-md dark:bg-green-900">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✅ Database is now clean and ready for testing!
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}