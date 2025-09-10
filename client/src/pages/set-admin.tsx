import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function SetAdminPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const setAdmin = async () => {
    setIsRunning(true);
    setError("");
    setSuccess(false);

    try {
      const response = await apiRequest("POST", "/api/set-admin");
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to set admin role");
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
          <CardTitle>Set Admin Access</CardTitle>
          <CardDescription>
            Click the button below to get admin access for the cleanup page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={setAdmin} 
            disabled={isRunning || success}
            className="w-full"
            data-testid="button-set-admin"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success ? "✓ Admin Access Granted!" : isRunning ? "Setting Admin..." : "Make Me Admin"}
          </Button>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 font-medium">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Admin access granted successfully!</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ You can now access: <strong>curiosities.market/admin/cleanup</strong>
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