import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

const editListingSchema = z.object({
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

type EditListingForm = z.infer<typeof editListingSchema>;

export default function EditListing() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch listing data
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ["/api/listings", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Listing not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Load categories
  useEffect(() => {
    setCategoriesLoading(true);
    fetch("/api/categories", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const loadedCategories = Array.isArray(data) ? data : [];
        if (loadedCategories.length === 0) {
          // Fallback categories (same as in create-listing)
          const fallbackCategories = [
            { id: 'antique', name: 'Antique', slug: 'antique' },
            { id: 'bones-skulls', name: 'Bones & Skulls', slug: 'bones-skulls' },
            { id: 'candles', name: 'Candles', slug: 'candles' },
            { id: 'crystals', name: 'Crystals', slug: 'crystals' },
            { id: 'funeral', name: 'Funeral', slug: 'funeral' },
            { id: 'jewelry', name: 'Jewelry', slug: 'jewelry' },
            { id: 'medical-art', name: 'Medical Art', slug: 'medical-art' },
            { id: 'murderabilia', name: 'Murderabilia', slug: 'murderabilia' },
            { id: 'occult', name: 'Occult', slug: 'occult' },
            { id: 'taxidermy', name: 'Taxidermy', slug: 'taxidermy' },
            { id: 'vintage', name: 'Vintage', slug: 'vintage' },
            { id: 'wall-art', name: 'Wall Art', slug: 'wall-art' },
            { id: 'wet-specimens', name: 'Wet Specimens', slug: 'wet-specimens' },
          ] as Category[];
          setCategories(fallbackCategories);
        } else {
          setCategories(loadedCategories);
        }
        setCategoriesLoading(false);
      })
      .catch(error => {
        console.error("Error loading categories:", error);
        setCategoriesLoading(false);
      });
  }, []);

  const form = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      quantity: "1",
      shippingCost: "0",
      categoryIds: [],
      speciesOrMaterial: "",
      provenance: "",
      tags: "",
      sku: "",
      mpn: "",
    },
  });

  // Update form when listing data loads
  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        quantity: listing.quantity?.toString() || "1",
        shippingCost: listing.shippingCost?.toString() || "0",
        categoryIds: listing.categoryIds || [],
        speciesOrMaterial: listing.speciesOrMaterial || "",
        provenance: listing.provenance || "",
        tags: listing.tags?.join(", ") || "",
        sku: listing.sku || "",
        mpn: listing.mpn || "",
      });
    }
  }, [listing, form]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: EditListingForm) => {
      const payload = {
        ...data,
        quantity: parseInt(data.quantity),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      return apiRequest("PUT", `/api/listings/${id}`, payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Listing Updated",
        description: "Your listing has been updated successfully!",
      });
      // Navigate to the product page using the slug
      const slug = data.slug || listing?.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('[EDIT-SUCCESS] Mutation response:', data);
      console.log('[EDIT-SUCCESS] Using slug:', slug);
      navigate(`/product/${slug}`);
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditListingForm) => {
    updateListingMutation.mutate(data);
  };

  if (authLoading || listingLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-64 bg-zinc-800 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <Button onClick={() => navigate("/seller/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/seller/dashboard")}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-serif font-bold">Edit Listing</h1>
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Update Your Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      {...form.register("title")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="Enter listing title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-400 text-sm">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price ($) *</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      {...form.register("price")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="0.00"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-400 text-sm">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    className="bg-zinc-900 border-zinc-700 min-h-32"
                    placeholder="Describe your item in detail"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-400 text-sm">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories *</Label>
                  {categoriesLoading ? (
                    <div className="text-zinc-400">Loading categories...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={form.watch("categoryIds").includes(category.id)}
                            onCheckedChange={(checked) => {
                              const currentIds = form.getValues("categoryIds");
                              if (checked) {
                                form.setValue("categoryIds", [...currentIds, category.id]);
                              } else {
                                form.setValue("categoryIds", currentIds.filter(id => id !== category.id));
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.categoryIds && (
                    <p className="text-red-400 text-sm">{form.formState.errors.categoryIds.message}</p>
                  )}
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      {...form.register("quantity")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="1"
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-red-400 text-sm">{form.formState.errors.quantity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                    <Input
                      id="shippingCost"
                      {...form.register("shippingCost")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="0.00"
                    />
                    {form.formState.errors.shippingCost && (
                      <p className="text-red-400 text-sm">{form.formState.errors.shippingCost.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="speciesOrMaterial">Species/Material</Label>
                    <Input
                      id="speciesOrMaterial"
                      {...form.register("speciesOrMaterial")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="e.g., Human bone, Victorian silver"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...form.register("sku")}
                      className="bg-zinc-900 border-zinc-700"
                      placeholder="Product SKU"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provenance">Provenance</Label>
                  <Textarea
                    id="provenance"
                    {...form.register("provenance")}
                    className="bg-zinc-900 border-zinc-700"
                    placeholder="History and origin of the item"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    {...form.register("tags")}
                    className="bg-zinc-900 border-zinc-700"
                    placeholder="gothic, vintage, rare"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/seller/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gothic-red hover:bg-gothic-red/80 text-white"
                    disabled={updateListingMutation.isPending}
                  >
                    {updateListingMutation.isPending ? "Updating..." : "Update Listing"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}