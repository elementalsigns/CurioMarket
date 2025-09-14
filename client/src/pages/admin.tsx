import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTable } from "@/components/admin/EventsTable";
import { ExpirationManager } from "@/components/admin/ExpirationManager";
import { Loader2, AlertTriangle, CheckCircle, Shield, Calendar, Database, Settings } from "lucide-react";

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
        
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-2" data-testid="tab-events">
              <Calendar className="h-4 w-4" />
              Event Management
            </TabsTrigger>
            <TabsTrigger value="expiration" className="flex items-center gap-2" data-testid="tab-expiration">
              <Settings className="h-4 w-4" />
              Auto-Expiration
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2" data-testid="tab-database">
              <Database className="h-4 w-4" />
              Database Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Event Management</h2>
              <p className="text-muted-foreground">
                Manage all events on the platform, moderate content, and control event status.
              </p>
            </div>
            <EventsTable />
          </TabsContent>

          <TabsContent value="expiration" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Auto-Expiration Management</h2>
              <p className="text-muted-foreground">
                Configure and manage automatic expiration of old events to keep listings current.
              </p>
            </div>
            <ExpirationManager />
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