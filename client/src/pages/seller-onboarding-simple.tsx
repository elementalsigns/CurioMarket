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
import { Store, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function SellerOnboardingSimple() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    shopName: "",
    bio: "",
    location: "",
    policies: ""
  });
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const createSellerMutation = useMutation({
    mutationFn: async (data: typeof formData & { banner?: string; avatar?: string }) => {
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

    createSellerMutation.mutate({
      ...formData,
      banner: bannerUrl || undefined,
      avatar: avatarUrl || undefined,
    });
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

                {/* Shop Banner Upload */}
                <div>
                  <Label className="text-foreground">Shop Banner (Optional)</Label>
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
                  <Label className="text-foreground">Shop Profile Picture (Optional)</Label>
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