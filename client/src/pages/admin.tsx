import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  if (!user || user.role !== 'admin') {
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
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Cleanup</CardTitle>
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
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="font-medium">Error: {error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Cleanup Completed Successfully!</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>Orders Removed:</strong> {result.stats.ordersRemoved}</p>
                    <p><strong>Inventory Restored:</strong> {result.stats.inventoryRestored} units</p>
                    <p><strong>Failed Orders Found:</strong> {result.stats.failedOrdersFound}</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ Database is now clean and ready for testing!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}