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
import { Upload as UploadIcon, X as XIcon, Eye as EyeIcon, Info as InfoIcon } from "lucide-react";
import { ImageUploadGrid } from "@/components/ImageUploadGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Category } from "@shared/schema";

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a valid positive number"),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Quantity must be a valid positive number"),
  categoryIds: z.array(z.string()).min(1, "Please select at least one category"),
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
  const [, setLocation] = useLocation();
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Product Variants state
  const [variations, setVariations] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({
    name: '',
    priceAdjustment: '',
    stockQuantity: '',
    sku: '',
    isActive: true
  });

  // Direct category loading without React Query complications
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  useEffect(() => {
    setCategoriesLoading(true);
    fetch("/api/categories", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const loadedCategories = Array.isArray(data) ? data : [];
        // If API returns empty array, use fallback categories
        if (loadedCategories.length === 0) {
          const fallbackCategories = [
            { id: 'antique', name: 'Antique', slug: 'antique', description: 'Authentic antique pieces', icon: null, parentId: null, createdAt: new Date() },
            { id: 'bones-skulls', name: 'Bones & Skulls', slug: 'bones-skulls', description: 'Skeletal remains and specimens', icon: null, parentId: null, createdAt: new Date() },
            { id: 'candles', name: 'Candles', slug: 'candles', description: 'Gothic and occult candles', icon: null, parentId: null, createdAt: new Date() },
            { id: 'crystals', name: 'Crystals', slug: 'crystals', description: 'Natural crystals and gemstones', icon: null, parentId: null, createdAt: new Date() },
            { id: 'divination', name: 'Divination', slug: 'divination', description: 'Divination tools and mystical instruments', icon: null, parentId: null, createdAt: new Date() },
            { id: 'funeral', name: 'Funeral', slug: 'funeral', description: 'Funeral and mortuary items', icon: null, parentId: null, createdAt: new Date() },
            { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', description: 'Gothic and occult jewelry', icon: null, parentId: null, createdAt: new Date() },
            { id: 'medical-art', name: 'Medical Art', slug: 'medical-art', description: 'Medical instruments and art', icon: null, parentId: null, createdAt: new Date() },
            { id: 'murderabilia', name: 'Murderabilia', slug: 'murderabilia', description: 'Crime-related collectibles', icon: null, parentId: null, createdAt: new Date() },
            { id: 'occult', name: 'Occult', slug: 'occult', description: 'Dark and mystical items', icon: null, parentId: null, createdAt: new Date() },
            { id: 'taxidermy', name: 'Taxidermy', slug: 'taxidermy', description: 'Preserved animal specimens', icon: null, parentId: null, createdAt: new Date() },
            { id: 'vintage', name: 'Vintage', slug: 'vintage', description: 'Vintage items from past eras', icon: null, parentId: null, createdAt: new Date() },
            { id: 'wall-art', name: 'Wall Art', slug: 'wall-art', description: 'Dark and mystical wall art', icon: null, parentId: null, createdAt: new Date() },
            { id: 'wet-specimens', name: 'Wet Specimens', slug: 'wet-specimens', description: 'Preserved biological specimens', icon: null, parentId: null, createdAt: new Date() }
          ];
          console.log('[CATEGORIES] Using fallback categories due to empty API response');
          setCategories(fallbackCategories);
        } else {
          setCategories(loadedCategories);
        }
        setCategoriesLoading(false);
      })
      .catch(err => {
        console.error("Failed to load categories:", err);
        // Use fallback categories on error too
        const fallbackCategories = [
          { id: 'antique', name: 'Antique', slug: 'antique', description: 'Authentic antique pieces', icon: null, parentId: null, createdAt: new Date() },
          { id: 'bones-skulls', name: 'Bones & Skulls', slug: 'bones-skulls', description: 'Skeletal remains and specimens', icon: null, parentId: null, createdAt: new Date() },
          { id: 'candles', name: 'Candles', slug: 'candles', description: 'Gothic and occult candles', icon: null, parentId: null, createdAt: new Date() },
          { id: 'crystals', name: 'Crystals', slug: 'crystals', description: 'Natural crystals and gemstones', icon: null, parentId: null, createdAt: new Date() },
          { id: 'funeral', name: 'Funeral', slug: 'funeral', description: 'Funeral and mortuary items', icon: null, parentId: null, createdAt: new Date() },
          { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', description: 'Gothic and occult jewelry', icon: null, parentId: null, createdAt: new Date() },
          { id: 'medical-art', name: 'Medical Art', slug: 'medical-art', description: 'Medical instruments and art', icon: null, parentId: null, createdAt: new Date() },
          { id: 'murderabilia', name: 'Murderabilia', slug: 'murderabilia', description: 'Crime-related collectibles', icon: null, parentId: null, createdAt: new Date() },
          { id: 'occult', name: 'Occult', slug: 'occult', description: 'Dark and mystical items', icon: null, parentId: null, createdAt: new Date() },
          { id: 'taxidermy', name: 'Taxidermy', slug: 'taxidermy', description: 'Preserved animal specimens', icon: null, parentId: null, createdAt: new Date() },
          { id: 'vintage', name: 'Vintage', slug: 'vintage', description: 'Vintage items from past eras', icon: null, parentId: null, createdAt: new Date() },
          { id: 'wall-art', name: 'Wall Art', slug: 'wall-art', description: 'Dark and mystical wall art', icon: null, parentId: null, createdAt: new Date() },
          { id: 'wet-specimens', name: 'Wet Specimens', slug: 'wet-specimens', description: 'Preserved biological specimens', icon: null, parentId: null, createdAt: new Date() }
        ];
        console.log('[CATEGORIES] Using fallback categories due to API error');
        setCategories(fallbackCategories);
        setCategoriesLoading(false);
      });
  }, []);

  console.log('[CATEGORIES] Current categories:', categories);
  console.log('[CATEGORIES] Categories loading:', categoriesLoading);
  
  // Force fallback categories if we end up with an empty array after loading
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0) {
      const fallbackCategories = [
        { id: 'antique', name: 'Antique', slug: 'antique', description: 'Authentic antique pieces', icon: null, parentId: null, createdAt: new Date() },
        { id: 'bones-skulls', name: 'Bones & Skulls', slug: 'bones-skulls', description: 'Skeletal remains and specimens', icon: null, parentId: null, createdAt: new Date() },
        { id: 'candles', name: 'Candles', slug: 'candles', description: 'Gothic and occult candles', icon: null, parentId: null, createdAt: new Date() },
        { id: 'crystals', name: 'Crystals', slug: 'crystals', description: 'Natural crystals and gemstones', icon: null, parentId: null, createdAt: new Date() },
        { id: 'funeral', name: 'Funeral', slug: 'funeral', description: 'Funeral and mortuary items', icon: null, parentId: null, createdAt: new Date() },
        { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', description: 'Gothic and occult jewelry', icon: null, parentId: null, createdAt: new Date() },
        { id: 'medical-art', name: 'Medical Art', slug: 'medical-art', description: 'Medical instruments and art', icon: null, parentId: null, createdAt: new Date() },
        { id: 'murderabilia', name: 'Murderabilia', slug: 'murderabilia', description: 'Crime-related collectibles', icon: null, parentId: null, createdAt: new Date() },
        { id: 'occult', name: 'Occult', slug: 'occult', description: 'Dark and mystical items', icon: null, parentId: null, createdAt: new Date() },
        { id: 'taxidermy', name: 'Taxidermy', slug: 'taxidermy', description: 'Preserved animal specimens', icon: null, parentId: null, createdAt: new Date() },
        { id: 'vintage', name: 'Vintage', slug: 'vintage', description: 'Vintage items from past eras', icon: null, parentId: null, createdAt: new Date() },
        { id: 'wall-art', name: 'Wall Art', slug: 'wall-art', description: 'Dark and mystical wall art', icon: null, parentId: null, createdAt: new Date() },
        { id: 'wet-specimens', name: 'Wet Specimens', slug: 'wet-specimens', description: 'Preserved biological specimens', icon: null, parentId: null, createdAt: new Date() }
      ];
      console.log('[CATEGORIES] Forcing fallback categories after load completed with empty array');
      setCategories(fallbackCategories);
    }
  }, [categoriesLoading, categories.length]);


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
      categoryIds: [],
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
        quantity: parseInt(data.quantity),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        images: images, // Include the uploaded images
        state: 'published',
        variations: variations, // Include product variants
      };
      const response = await apiRequest("POST", "/api/listings", payload);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Listing Created",
        description: "Your listing has been created successfully!",
      });
      // Navigate back to seller dashboard after successful creation
      console.log('[CREATE-SUCCESS] Response data:', data);
      console.log('[CREATE-SUCCESS] Redirecting to dashboard');
      setLocation('/seller/dashboard');
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

  // Variant management handlers
  const handleAddVariation = () => {
    // Validate inputs
    if (!newVariant.name.trim()) {
      toast({
        title: "Error",
        description: "Variant name is required",
        variant: "destructive",
      });
      return;
    }

    const priceAdj = parseFloat(newVariant.priceAdjustment || '0');
    const stock = parseInt(newVariant.stockQuantity || '0');

    if (isNaN(priceAdj) || isNaN(stock)) {
      toast({
        title: "Error",
        description: "Invalid price adjustment or stock quantity",
        variant: "destructive",
      });
      return;
    }

    // Add new variant to local state
    const variant = {
      id: `temp-${Date.now()}`,
      name: newVariant.name.trim(),
      priceAdjustment: priceAdj.toFixed(2),
      stockQuantity: stock,
      sku: newVariant.sku.trim() || null,
      isActive: newVariant.isActive
    };

    setVariations([...variations, variant]);

    // Reset form
    setNewVariant({
      name: '',
      priceAdjustment: '',
      stockQuantity: '',
      sku: '',
      isActive: true
    });

    toast({
      title: "Variant Added",
      description: `Added variant: ${variant.name}`,
    });
  };

  const handleUpdateVariation = (id: string, field: string, value: any) => {
    setVariations(variations.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
    toast({
      title: "Variant Removed",
      description: "The variant has been removed",
    });
  };

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
                <EyeIcon className="mr-2" size={16} />
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
                        <Label>Categories * (Select at least one)</Label>
                        <div className="mt-2 space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                          {(!categoriesLoading && categories.length === 0) ? (
                            <p className="text-sm text-muted-foreground">Loading categories...</p>
                          ) : (
                            categories.map((category: Category) => (
                              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  id={`category-${category.id}`}
                                  value={category.id}
                                  onChange={(e) => {
                                    const currentIds = watch("categoryIds") || [];
                                    if (e.target.checked) {
                                      setValue("categoryIds", [...currentIds, category.id]);
                                    } else {
                                      setValue("categoryIds", currentIds.filter(id => id !== category.id));
                                    }
                                  }}
                                  className="rounded border-border"
                                  data-testid={`checkbox-category-${category.id}`}
                                />
                                <span className="text-sm">{category.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        {errors.categoryIds && (
                          <p className="text-destructive text-sm mt-1" data-testid="error-category">
                            {errors.categoryIds.message}
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
                            <InfoIcon size={16} />
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
                        <div className="flex items-center gap-2">
                          <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-auto text-muted-foreground hover:text-foreground"
                                data-testid="button-sku-info"
                              >
                                <InfoIcon className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-700">
                              <DialogHeader>
                                <DialogTitle>SKU Benefits for Google Shopping</DialogTitle>
                                <DialogDescription>
                                  <div className="space-y-3 text-sm">
                                    <p>
                                      <strong className="text-red-400">Required for Google Shopping:</strong> SKUs are mandatory for Google Shopping campaigns and help you track inventory across platforms.
                                    </p>
                                    <p>
                                      <strong className="text-red-400">Better Ad Performance:</strong> Products with SKUs get higher priority in Google's algorithm and better approval rates.
                                    </p>
                                    <p>
                                      <strong className="text-red-400">Analytics & Tracking:</strong> SKUs enable detailed performance tracking and inventory management across multiple sales channels.
                                    </p>
                                    <p className="text-zinc-400">
                                      Create a unique identifier like: VIC-OCT-001 (Victorian-Octopus-001)
                                    </p>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Input
                          id="sku"
                          name="sku"
                          {...register("sku")}
                          placeholder="e.g., VIC-OCT-001"
                          className="mt-1"
                          data-testid="input-sku"
                        />
                        <p className="text-xs text-foreground/60 mt-1">
                          Your unique identifier for this item • <span className="text-red-400">Boosts Google Shopping visibility</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="mpn">MPN (Manufacturer Part Number)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-auto text-muted-foreground hover:text-foreground"
                                data-testid="button-mpn-info"
                              >
                                <InfoIcon className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-700">
                              <DialogHeader>
                                <DialogTitle>MPN Benefits for Advertising</DialogTitle>
                                <DialogDescription>
                                  <div className="space-y-3 text-sm">
                                    <p>
                                      <strong className="text-red-400">Higher Approval Rates:</strong> Products with MPNs have significantly higher approval rates on Google Shopping and Facebook Catalog.
                                    </p>
                                    <p>
                                      <strong className="text-red-400">Better Product Matching:</strong> Advertising platforms use MPNs to match your products with existing catalogs, improving visibility.
                                    </p>
                                    <p>
                                      <strong className="text-red-400">Enhanced Trust:</strong> MPNs signal authenticity and help buyers find exactly what they're looking for.
                                    </p>
                                    <p className="text-zinc-400">
                                      Use original maker codes if available, or create your own: SPEC-8ARM-1885 (Specimen-8Arms-1885)
                                    </p>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Input
                          id="mpn"
                          name="mpn"
                          {...register("mpn")}
                          placeholder="e.g., SPEC-8ARM-1885"
                          className="mt-1"
                          data-testid="input-mpn"
                        />
                        <p className="text-xs text-foreground/60 mt-1">
                          Original maker's identifier, if applicable • <span className="text-red-400">Improves ad approval rates</span>
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

                  {/* Product Variants */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold mb-2">Product Variants (Optional)</h3>
                      <p className="text-sm text-foreground/60 mb-4">
                        Add variations like sizes, colors, or conditions with individual pricing and stock
                      </p>
                    </div>

                    {/* Add New Variant Form */}
                    <Card className="bg-zinc-900 border-zinc-700">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="variantName">Variant Name *</Label>
                            <Input
                              id="variantName"
                              value={newVariant.name}
                              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                              placeholder="e.g., Small, Red, Excellent Condition"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="variantPriceAdj">Price Adjustment ($)</Label>
                            <Input
                              id="variantPriceAdj"
                              type="number"
                              step="0.01"
                              value={newVariant.priceAdjustment}
                              onChange={(e) => setNewVariant({ ...newVariant, priceAdjustment: e.target.value })}
                              placeholder="0.00 (use negative for discount)"
                              className="mt-1"
                            />
                            <p className="text-xs text-foreground/60 mt-1">
                              Positive for upcharge, negative for discount
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="variantStock">Stock Quantity *</Label>
                            <Input
                              id="variantStock"
                              type="number"
                              min="0"
                              value={newVariant.stockQuantity}
                              onChange={(e) => setNewVariant({ ...newVariant, stockQuantity: e.target.value })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="variantSku">SKU (Optional)</Label>
                            <Input
                              id="variantSku"
                              value={newVariant.sku}
                              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                              placeholder="Variant SKU"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddVariation}
                          variant="outline"
                          className="w-full"
                        >
                          Add Variant
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Existing Variants List */}
                    {variations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Added Variants ({variations.length})</h4>
                        {variations.map((variant) => (
                          <Card key={variant.id} className="bg-zinc-900 border-zinc-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label className="text-xs text-foreground/60">Name</Label>
                                    <p className="font-medium">{variant.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-foreground/60">Price Adj.</Label>
                                    <p className={`font-medium ${parseFloat(variant.priceAdjustment) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {parseFloat(variant.priceAdjustment) >= 0 ? '+' : ''}${parseFloat(variant.priceAdjustment).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-foreground/60">Stock</Label>
                                    <p className="font-medium">{variant.stockQuantity}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-foreground/60">Status</Label>
                                    <p className={`font-medium ${variant.isActive ? 'text-green-400' : 'text-foreground/40'}`}>
                                      {variant.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVariation(variant.id)}
                                  className="text-destructive hover:text-destructive/80 ml-4"
                                >
                                  <XIcon size={16} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <ImageUploadGrid
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                  />

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
