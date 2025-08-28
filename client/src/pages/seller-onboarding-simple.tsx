import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Store } from "lucide-react";

export default function SellerOnboardingSimple() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    shopName: "",
    bio: "",
    location: "",
    policies: ""
  });

  const createSellerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/seller/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Shop Created!",
        description: "Your seller profile has been created successfully.",
      });
      setTimeout(() => {
        window.location.href = "/seller/dashboard";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shop profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.shopName.trim() || formData.shopName.length < 3) {
      toast({
        title: "Validation Error",
        description: "Shop name must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.bio.trim() || formData.bio.length < 50) {
      toast({
        title: "Validation Error", 
        description: "Bio must be at least 50 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Location is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.policies.trim() || formData.policies.length < 20) {
      toast({
        title: "Validation Error",
        description: "Policies must be at least 20 characters",
        variant: "destructive",
      });
      return;
    }

    createSellerMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Store className="mx-auto mb-4 text-gothic-red" size={48} />
            <h1 className="text-3xl font-bold font-serif mb-2">Create Your Shop</h1>
            <p className="text-foreground/70">
              Set up your seller profile to start listing your curiosities
            </p>
          </div>

          <Card className="glass-effect border-gothic-red/30">
            <CardHeader>
              <CardTitle className="text-gothic-red">Shop Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="shopName" className="text-foreground">
                    Shop Name *
                  </Label>
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) => handleChange("shopName", e.target.value)}
                    placeholder="Enter your shop name"
                    className="mt-1"
                    data-testid="input-shop-name"
                  />
                  {formData.shopName.length > 0 && formData.shopName.length < 3 && (
                    <p className="text-red-500 text-sm mt-1">Must be at least 3 characters</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="text-foreground">
                    Shop Bio *
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell customers about your shop and what makes your items special..."
                    className="mt-1 min-h-24"
                    data-testid="input-bio"
                  />
                  <p className="text-sm text-foreground/60 mt-1">
                    {formData.bio.length}/50 characters minimum
                  </p>
                </div>

                <div>
                  <Label htmlFor="location" className="text-foreground">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="City, Country"
                    className="mt-1"
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="policies" className="text-foreground">
                    Shop Policies *
                  </Label>
                  <Textarea
                    id="policies"
                    value={formData.policies}
                    onChange={(e) => handleChange("policies", e.target.value)}
                    placeholder="Return policy, shipping information, care instructions..."
                    className="mt-1 min-h-20"
                    data-testid="input-policies"
                  />
                  <p className="text-sm text-foreground/60 mt-1">
                    {formData.policies.length}/20 characters minimum
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createSellerMutation.isPending}
                  className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
                  data-testid="button-create-shop"
                >
                  {createSellerMutation.isPending ? "Creating Shop..." : "Create Shop"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}