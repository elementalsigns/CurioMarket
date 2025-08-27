import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, X, Eye, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a valid positive number"),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Quantity must be a valid positive number"),
  categoryId: z.string().min(1, "Please select a category"),
  speciesOrMaterial: z.string().optional(),
  provenance: z.string().optional(),
  shippingCost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Shipping cost must be a valid number"),
  tags: z.string().optional(),
  sku: z.string().optional(),
  mpn: z.string().optional(),
});

type CreateListingForm = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      quantity: "1",
      shippingCost: "0",
    },
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

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingForm) => {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity),
        shippingCost: parseFloat(data.shippingCost),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        state: 'published',
      };
      return apiRequest("POST", "/api/listings", payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Listing Created",
        description: "Your listing has been created successfully!",
      });
      navigate("/seller/dashboard");
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

  const onSubmit = (data: CreateListingForm) => {
    createListingMutation.mutate(data);
  };

  const watchedValues = watch();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8" data-testid="create-listing-header">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Create New Listing</h1>
              <p className="text-foreground/70">Share your oddity with collectors worldwide</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                data-testid="button-toggle-preview"
              >
                <Eye className="mr-2" size={16} />
                {previewMode ? "Edit" : "Preview"}
              </Button>
            </div>
          </div>

          {!previewMode ? (
            <Card className="glass-effect border border-gothic-purple/30" data-testid="listing-form">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Listing Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="e.g., Victorian Era Preserved Octopus Specimen"
                        className="mt-1"
                        data-testid="input-title"
                      />
                      {errors.title && (
                        <p className="text-destructive text-sm mt-1" data-testid="error-title">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Provide a detailed description of your item, including its history, condition, and any unique features..."
                        rows={6}
                        className="mt-1"
                        data-testid="textarea-description"
                      />
                      {errors.description && (
                        <p className="text-destructive text-sm mt-1" data-testid="error-description">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoryId">Category *</Label>
                        <Select onValueChange={(value) => setValue("categoryId", value)}>
                          <SelectTrigger className="mt-1" data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && (
                          <p className="text-destructive text-sm mt-1" data-testid="error-category">
                            {errors.categoryId.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="speciesOrMaterial">Species/Material</Label>
                        <Input
                          id="speciesOrMaterial"
                          {...register("speciesOrMaterial")}
                          placeholder="e.g., Octopus vulgaris, Bronze, Wood"
                          className="mt-1"
                          data-testid="input-species"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold">Pricing & Inventory</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price")}
                          placeholder="0.00"
                          className="mt-1"
                          data-testid="input-price"
                        />
                        {errors.price && (
                          <p className="text-destructive text-sm mt-1" data-testid="error-price">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          {...register("quantity")}
                          placeholder="1"
                          className="mt-1"
                          data-testid="input-quantity"
                        />
                        {errors.quantity && (
                          <p className="text-destructive text-sm mt-1" data-testid="error-quantity">
                            {errors.quantity.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="shippingCost">Shipping Cost ($) *</Label>
                        <Input
                          id="shippingCost"
                          type="number"
                          step="0.01"
                          {...register("shippingCost")}
                          placeholder="0.00"
                          className="mt-1"
                          data-testid="input-shipping"
                        />
                        {errors.shippingCost && (
                          <p className="text-destructive text-sm mt-1" data-testid="error-shipping">
                            {errors.shippingCost.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold">Additional Information</h3>
                    
                    <div>
                      <Label htmlFor="provenance">Provenance</Label>
                      <Textarea
                        id="provenance"
                        {...register("provenance")}
                        placeholder="Describe the history and origin of this item..."
                        rows={3}
                        className="mt-1"
                        data-testid="textarea-provenance"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        {...register("tags")}
                        placeholder="vintage, victorian, specimen, oddity"
                        className="mt-1"
                        data-testid="input-tags"
                      />
                    </div>
                  </div>

                  {/* Product Identifiers */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-serif font-bold">Product Identifiers</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto text-foreground/60 hover:text-foreground">
                            <Info size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-serif">Why are SKU and MPN Important?</DialogTitle>
                            <DialogDescription className="space-y-3 text-left">
                              <p>
                                <strong>SKU (Stock Keeping Unit)</strong> and <strong>MPN (Manufacturer Part Number)</strong> 
                                are product identifiers that significantly improve your listing's visibility and performance.
                              </p>
                              <p>
                                <strong>Benefits for Google Shopping:</strong>
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Enhanced product matching and categorization</li>
                                <li>Improved search ranking and visibility</li>
                                <li>Better product comparison functionality</li>
                                <li>Increased click-through rates from Google Shopping ads</li>
                              </ul>
                              <p>
                                <strong>These identifiers are completely free to use</strong> and can be created by you 
                                for unique items. For manufactured goods, use the actual MPN when available.
                              </p>
                              <p className="text-sm font-medium">
                                Adding these identifiers helps Google better understand and promote your unique curiosities 
                                to interested collectors and enthusiasts.
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                        <Input
                          id="sku"
                          {...register("sku")}
                          placeholder="e.g., VIC-OCT-001"
                          className="mt-1"
                          data-testid="input-sku"
                        />
                        <p className="text-xs text-foreground/60 mt-1">
                          Your unique identifier for this item
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="mpn">MPN (Manufacturer Part Number)</Label>
                        <Input
                          id="mpn"
                          {...register("mpn")}
                          placeholder="e.g., SPEC-8ARM-1885"
                          className="mt-1"
                          data-testid="input-mpn"
                        />
                        <p className="text-xs text-foreground/60 mt-1">
                          Original maker's identifier, if applicable
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="text-sm text-foreground/70 hover:text-foreground underline p-0 h-auto">
                            Why is this important?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="font-serif">Boost Your Visibility with Product Identifiers</DialogTitle>
                            <DialogDescription className="space-y-4 text-left">
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Google Shopping Advantages</h4>
                                <p className="text-sm">
                                  Product identifiers like SKU and MPN help Google Shopping algorithms better understand, 
                                  categorize, and promote your unique items to the right audience.
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Key Benefits</h4>
                                <ul className="text-sm space-y-1">
                                  <li>• <strong>Improved Search Rankings:</strong> Better visibility in Google Shopping results</li>
                                  <li>• <strong>Enhanced Product Matching:</strong> More accurate categorization of your items</li>
                                  <li>• <strong>Professional Appearance:</strong> Shows attention to detail and professionalism</li>
                                  <li>• <strong>Inventory Management:</strong> Easier tracking of your unique items</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Completely Free</h4>
                                <p className="text-sm">
                                  These identifiers cost nothing to implement. For unique curiosities, you can create your own 
                                  SKU system (e.g., "SKULL-RAVEN-001"). For items with existing manufacturer numbers, use those when available.
                                </p>
                              </div>
                              
                              <div className="bg-muted/30 p-3 rounded-lg">
                                <p className="text-sm font-medium">
                                  Adding SKU and MPN helps Google connect serious collectors and enthusiasts with your unique items, 
                                  potentially increasing both visibility and sales.
                                </p>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Image Upload Placeholder */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold">Images</h3>
                    <Card className="glass-effect border-dashed border-2 border-border" data-testid="image-upload">
                      <CardContent className="p-8 text-center">
                        <Upload className="mx-auto mb-4 text-foreground/40" size={48} />
                        <h4 className="text-lg font-medium mb-2">Upload Images</h4>
                        <p className="text-foreground/60 mb-4">
                          Add up to 10 high-quality images of your item. The first image will be the main image.
                        </p>
                        <Button variant="outline" disabled data-testid="button-upload-images">
                          Choose Images (Coming Soon)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Compliance Notice */}
                  <Card className="bg-gothic-purple/10 border border-gothic-purple/30" data-testid="compliance-notice">
                    <CardContent className="p-4">
                      <h4 className="font-serif font-bold mb-2">Compliance Reminder</h4>
                      <p className="text-sm text-foreground/80">
                        Ensure your listing complies with all local, state, and federal laws. Prohibited items include 
                        endangered species, human remains (except teeth and hair), firearms, explosives, and hazardous materials. 
                        Human teeth and hair must be properly documented and ethically sourced.
                      </p>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    disabled={createListingMutation.isPending}
                    className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
                    data-testid="button-create-listing"
                  >
                    {createListingMutation.isPending ? "Creating Listing..." : "Create Listing"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Preview Mode */
            <Card className="glass-effect" data-testid="listing-preview">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-square rounded-2xl bg-card flex items-center justify-center mb-4">
                      <div className="text-6xl opacity-50">📦</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-3xl font-serif font-bold" data-testid="preview-title">
                      {watchedValues.title || "Your listing title"}
                    </h1>
                    
                    <div className="text-4xl font-bold text-gothic-red" data-testid="preview-price">
                      ${watchedValues.price || "0.00"}
                    </div>
                    
                    <div className="text-foreground/80" data-testid="preview-description">
                      {watchedValues.description || "Your listing description will appear here..."}
                    </div>
                    
                    {watchedValues.speciesOrMaterial && (
                      <div>
                        <h3 className="font-serif font-bold mb-2">Species/Material</h3>
                        <p className="text-foreground/80" data-testid="preview-species">
                          {watchedValues.speciesOrMaterial}
                        </p>
                      </div>
                    )}
                    
                    {watchedValues.provenance && (
                      <div>
                        <h3 className="font-serif font-bold mb-2">Provenance</h3>
                        <p className="text-foreground/80" data-testid="preview-provenance">
                          {watchedValues.provenance}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
