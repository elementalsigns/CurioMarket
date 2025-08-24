import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Store, DollarSign, Users, BarChart3 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const sellerOnboardingSchema = z.object({
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  location: z.string().min(2, "Location is required"),
  policies: z.string().min(20, "Policies must be at least 20 characters"),
});

type SellerOnboardingForm = z.infer<typeof sellerOnboardingSchema>;

export default function SellerOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerOnboardingForm>({
    resolver: zodResolver(sellerOnboardingSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const createSellerMutation = useMutation({
    mutationFn: async (data: SellerOnboardingForm) => {
      return apiRequest("POST", "/api/sellers/onboard", data);
    },
    onSuccess: () => {
      toast({
        title: "Seller Profile Created",
        description: "Your seller profile has been created successfully!",
      });
      navigate("/subscribe");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellerOnboardingForm) => {
    createSellerMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="onboarding-header">
            <h1 className="text-4xl font-serif font-bold mb-4 text-white hover:text-gothic-red transition-colors cursor-default">
              Become a Curiosities Market Seller
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Join thousands of collectors sharing their unique oddities with the world. Set up your shop in minutes.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-4 gap-6 mb-12" data-testid="benefits-grid">
            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <Store className="mx-auto mb-4 text-gothic-purple" size={48} />
                <h3 className="font-serif font-bold mb-2">Your Own Shop</h3>
                <p className="text-sm text-foreground/70">Custom branding and unlimited listings</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <DollarSign className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="font-serif font-bold mb-2">Low Fees</h3>
                <p className="text-sm text-foreground/70">2.6% platform fee (5.5% total with Stripe)</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <Users className="mx-auto mb-4 text-gothic-purple" size={48} />
                <h3 className="font-serif font-bold mb-2">Growing Community</h3>
                <p className="text-sm text-foreground/70">Access to thousands of oddity collectors</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center">
              <CardContent className="p-6">
                <BarChart3 className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="font-serif font-bold mb-2">Analytics</h3>
                <p className="text-sm text-foreground/70">Track your sales and optimize your listings</p>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Form */}
          <Card className="glass-effect border border-gothic-purple/30" data-testid="onboarding-form">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Set Up Your Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="shopName">Shop Name *</Label>
                  <Input
                    id="shopName"
                    {...register("shopName")}
                    placeholder="e.g., Midnight Curiosities"
                    className="mt-1"
                    data-testid="input-shop-name"
                  />
                  {errors.shopName && (
                    <p className="text-destructive text-sm mt-1" data-testid="error-shop-name">
                      {errors.shopName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Shop Bio *</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell collectors about your passion for oddities and what makes your shop unique..."
                    rows={4}
                    className="mt-1"
                    data-testid="textarea-bio"
                  />
                  {errors.bio && (
                    <p className="text-destructive text-sm mt-1" data-testid="error-bio">
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g., Salem, MA"
                    className="mt-1"
                    data-testid="input-location"
                  />
                  {errors.location && (
                    <p className="text-destructive text-sm mt-1" data-testid="error-location">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="policies">Shop Policies *</Label>
                  <Textarea
                    id="policies"
                    {...register("policies")}
                    placeholder="Describe your return policy, shipping methods, and any other important shop policies..."
                    rows={4}
                    className="mt-1"
                    data-testid="textarea-policies"
                  />
                  {errors.policies && (
                    <p className="text-destructive text-sm mt-1" data-testid="error-policies">
                      {errors.policies.message}
                    </p>
                  )}
                </div>

                {/* Compliance Notice */}
                <Card className="bg-gothic-purple/10 border border-gothic-purple/30" data-testid="compliance-notice">
                  <CardContent className="p-4">
                    <h4 className="font-serif font-bold mb-2">Important Compliance Information</h4>
                    <p className="text-sm text-foreground/80">
                      By creating a seller account, you agree to comply with all local, state, and federal laws regarding the sale of oddities and specimens. Prohibited items include endangered species (CITES protected), human remains (with the exception of hair and teeth), firearms, explosives, and hazardous materials.
                    </p>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  disabled={createSellerMutation.isPending}
                  className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
                  data-testid="button-create-shop"
                >
                  {createSellerMutation.isPending ? "Creating Shop..." : "Create Your Shop"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="glass-effect mt-8" data-testid="next-steps">
            <CardContent className="p-6">
              <h3 className="text-lg font-serif font-bold mb-4">What Happens Next?</h3>
              <ol className="space-y-2 text-foreground/80">
                <li>1. Complete your seller subscription ($10/month)</li>
                <li>2. Create your first listing</li>
                <li>3. Start selling to collectors worldwide</li>
                <li>4. Track your progress with our analytics dashboard</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
