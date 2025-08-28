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
import { Store, DollarSign, Users, BarChart3, Upload } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ObjectUploader } from "@/components/ObjectUploader";

const sellerOnboardingSchema = z.object({
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  location: z.string().min(2, "Location is required"),
  policies: z.string().min(20, "Policies must be at least 20 characters"),
  banner: z.string().optional(),
  avatar: z.string().optional(),
});

type SellerOnboardingForm = z.infer<typeof sellerOnboardingSchema>;

export default function SellerOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

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

  // Check subscription status when user is available
  useEffect(() => {
    if (user && hasSubscription === null) {
      // Check if user has an active subscription
      fetch('/api/auth/user')
        .then(res => res.json())
        .then(userData => {
          if (userData.stripeSubscriptionId && userData.stripeSubscriptionId.trim() !== "") {
            setHasSubscription(true);
          } else {
            setHasSubscription(false);
            // Show clear message about subscription requirement
            toast({
              title: "Subscription Required - Step 1",
              description: "Please complete your seller subscription first, then return to create your shop.",
              variant: "destructive",
            });
            setTimeout(() => {
              navigate("/subscribe");
            }, 1500);
          }
        })
        .catch(() => {
          setHasSubscription(false);
          navigate("/subscribe");
        });
    }
  }, [user, hasSubscription, toast, navigate]);

  const createSellerMutation = useMutation({
    mutationFn: async (data: SellerOnboardingForm) => {
      return apiRequest("POST", "/api/sellers/onboard", data);
    },
    onSuccess: () => {
      toast({
        title: "Seller Profile Created",
        description: "Your seller profile has been created successfully!",
      });
      navigate("/seller/dashboard");
    },
    onError: (error: any) => {
      if (error?.status === 403 && error?.data?.error?.includes("subscription")) {
        toast({
          title: "Subscription Required",
          description: "Please complete your seller subscription first.",
          variant: "destructive",
        });
        navigate("/subscribe");
        return;
      }
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
    // Include banner and avatar URLs in submission
    const submissionData = {
      ...data,
      banner: bannerUrl || undefined,
      avatar: avatarUrl || undefined,
    };
    createSellerMutation.mutate(submissionData);
  };

  if (authLoading || hasSubscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-foreground/70">
            {authLoading ? "Loading..." : "Checking subscription status..."}
          </p>
        </div>
      </div>
    );
  }

  // If user doesn't have subscription, show a clear message before redirecting
  if (hasSubscription === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-lg mx-auto glass-effect border border-gothic-red/30">
            <CardHeader>
              <CardTitle className="font-serif text-center text-gothic-red">
                Seller Subscription Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-foreground/70">
                You've reached <strong>Step 2</strong>, but need to complete <strong>Step 1</strong> first.
              </p>
              <div className="bg-gothic-red/10 border border-gothic-red/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Complete Step 1 to unlock:</p>
                <ul className="text-sm text-left space-y-1">
                  <li>• Unlimited product listings</li>
                  <li>• Professional seller dashboard</li>
                  <li>• Direct customer messaging</li>
                  <li>• Sales analytics and reporting</li>
                </ul>
              </div>
              <p className="text-lg font-semibold">Step 1: Only $10/month subscription</p>
              <Button 
                onClick={() => navigate("/subscribe")}
                className="w-full bg-gothic-red hover:bg-gothic-red/80"
                data-testid="button-subscribe-step1"
              >
                Go to Step 1: Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Subscription Requirement Notice - Top Priority */}
          <Card className="mb-8 bg-gothic-red/10 border-2 border-gothic-red" data-testid="subscription-required-notice">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-serif text-gothic-red text-center">
                Important: Subscription Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-foreground/80">
                Before creating your shop, you'll need to complete your seller subscription ($10/month). 
                This gives you access to unlimited listings and seller tools.
              </p>
              <Button 
                onClick={() => navigate("/subscribe")}
                className="w-full max-w-md bg-gothic-red hover:bg-gothic-red/80"
                data-testid="button-start-subscription"
              >
                Start Subscription Setup
              </Button>
            </CardContent>
          </Card>

          {/* Header */}
          <div className="text-center mb-12" data-testid="onboarding-header">
            <div className="inline-flex items-center mb-6 space-x-4 text-sm text-foreground/60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gothic-red rounded-full flex items-center justify-center text-white font-bold">✓</div>
                <span>Step 1: Subscription Active</span>
              </div>
              <div className="w-12 h-px bg-gothic-red/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gothic-red rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span className="text-gothic-red font-medium">Step 2: Create Your Shop</span>
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4 text-white hover:text-gothic-red transition-colors cursor-default">
              Create Your Curiosities Shop
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Your subscription is active! Now set up your shop profile and start selling your unique oddities to collectors worldwide.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-4 gap-6 mb-12" data-testid="benefits-grid">
            <Card className="glass-effect text-center hover:border-gothic-red transition-colors">
              <CardContent className="p-6">
                <Store className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="font-serif font-bold mb-2">Your Own Shop</h3>
                <p className="text-sm text-foreground/70">Custom branding and unlimited listings</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center hover:border-gothic-red transition-colors">
              <CardContent className="p-6">
                <DollarSign className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="font-serif font-bold mb-2">Low Fees</h3>
                <p className="text-sm text-foreground/70">2.6% platform fee (5.5% total with Stripe)</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center hover:border-gothic-red transition-colors">
              <CardContent className="p-6">
                <Users className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="font-serif font-bold mb-2">Growing Community</h3>
                <p className="text-sm text-foreground/70">Access to thousands of oddity collectors</p>
              </CardContent>
            </Card>

            <Card className="glass-effect text-center hover:border-gothic-red transition-colors">
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
              <CardTitle className="text-2xl font-serif hover:text-gothic-red transition-colors cursor-default">Set Up Your Shop</CardTitle>
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

                {/* Shop Banner Upload */}
                <div>
                  <Label>Shop Banner (Optional)</Label>
                  <p className="text-sm text-foreground/70 mb-2">
                    Upload a banner image for your shop - this will be displayed at the top of your shop page
                  </p>
                  <p className="text-xs text-foreground/50 mb-3">
                    Recommended: 1200×300 pixels • JPG, PNG • Max 10MB
                  </p>
                  <div className="relative">
                    {bannerUrl ? (
                      <div className="space-y-3">
                        <div className="relative group">
                          <img 
                            src={bannerUrl} 
                            alt="Shop banner preview" 
                            className="w-full h-32 object-cover rounded-lg border border-gothic-purple/30"
                            data-testid="banner-preview"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ObjectUploader
                              maxNumberOfFiles={1}
                              maxFileSize={10485760}
                              allowedFileTypes={['image/*']}
                              onGetUploadParameters={async () => {
                                const response = await apiRequest("POST", "/api/objects/upload") as any;
                                return { method: "PUT" as const, url: response.uploadURL };
                              }}
                              onComplete={(result) => {
                                if (result.successful && result.successful[0]) {
                                  setBannerUrl(result.successful[0].uploadURL || "");
                                  toast({
                                    title: "Banner updated",
                                    description: "Your shop banner has been updated successfully.",
                                  });
                                }
                              }}
                              buttonClassName="bg-white/90 hover:bg-white text-black px-4 py-2 rounded text-sm font-medium"
                              data-testid="change-banner"
                            >
                              Change Banner
                            </ObjectUploader>
                          </div>
                        </div>
                        <p className="text-sm text-green-400" data-testid="banner-upload-success">
                          ✓ Banner uploaded successfully
                        </p>
                      </div>
                    ) : (
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        allowedFileTypes={['image/*']}
                        onGetUploadParameters={async () => {
                          const response = await apiRequest("POST", "/api/objects/upload") as any;
                          return { method: "PUT" as const, url: response.uploadURL };
                        }}
                        onComplete={(result) => {
                          if (result.successful && result.successful[0]) {
                            setBannerUrl(result.successful[0].uploadURL || "");
                            toast({
                              title: "Banner uploaded",
                              description: "Your shop banner has been uploaded successfully.",
                            });
                          }
                        }}
                        buttonClassName="border-2 border-dashed border-gothic-purple/30 hover:border-gothic-red transition-colors w-full h-32 rounded-lg bg-gothic-purple/5 hover:bg-gothic-purple/10"
                        data-testid="upload-banner"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload size={24} className="text-gothic-purple" />
                          <span className="text-foreground/70">Upload Shop Banner</span>
                          <span className="text-xs text-foreground/50">or drag and drop</span>
                        </div>
                      </ObjectUploader>
                    )}
                  </div>
                </div>

                {/* Shop Avatar Upload */}
                <div>
                  <Label>Shop Profile Picture (Optional)</Label>
                  <p className="text-sm text-foreground/70 mb-2">
                    Upload a profile picture for your shop - this will represent your brand throughout the marketplace
                  </p>
                  <p className="text-xs text-foreground/50 mb-3">
                    Recommended: 400×400 pixels (square) • JPG, PNG • Max 5MB
                  </p>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {avatarUrl ? (
                        <div className="relative group">
                          <img 
                            src={avatarUrl} 
                            alt="Shop profile picture preview" 
                            className="w-20 h-20 object-cover rounded-full border-2 border-gothic-purple/30"
                            data-testid="avatar-preview"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                            <Upload size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-gothic-purple/30 rounded-full bg-gothic-purple/5 flex items-center justify-center">
                          <Upload size={20} className="text-gothic-purple/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880}
                        allowedFileTypes={['image/*']}
                        onGetUploadParameters={async () => {
                          const response = await apiRequest("POST", "/api/objects/upload") as any;
                          return { method: "PUT" as const, url: response.uploadURL };
                        }}
                        onComplete={(result) => {
                          if (result.successful && result.successful[0]) {
                            setAvatarUrl(result.successful[0].uploadURL || "");
                            toast({
                              title: "Profile picture uploaded",
                              description: "Your shop profile picture has been uploaded successfully.",
                            });
                          }
                        }}
                        buttonClassName="border border-gothic-purple/30 hover:border-gothic-red transition-colors px-4 py-2 rounded text-sm"
                        data-testid="upload-avatar"
                      >
                        {avatarUrl ? "Change Photo" : "Add Photo"}
                      </ObjectUploader>
                      {avatarUrl && (
                        <p className="text-sm text-green-400 mt-2" data-testid="avatar-upload-success">
                          ✓ Profile picture uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
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
                <li>2. Set up your shop profile (this form)</li>
                <li>3. Create your first listing</li>
                <li>4. Start selling to collectors worldwide</li>
                <li>5. Track your progress with our analytics dashboard</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
