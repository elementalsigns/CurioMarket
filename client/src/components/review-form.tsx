import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Camera, X, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { useLocation } from "wouter";

// Helper function to convert Google Storage URLs to local /objects/ format
function convertImageUrl(url: string): string {
  if (!url || !url.startsWith('https://storage.googleapis.com/')) {
    return url;
  }
  
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex(part => part.includes('replit-objstore'));
  if (bucketIndex === -1) return url;
  
  const pathAfterBucket = urlParts.slice(bucketIndex + 1).join('/');
  const objectPath = pathAfterBucket.startsWith('.private/') 
    ? pathAfterBucket.replace('.private/', '') 
    : pathAfterBucket;
  
  return `/objects/${objectPath}`;
}

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Check if a review already exists for this order/product combination
  const { data: existingReview, isLoading: checkingReview } = useQuery({
    queryKey: ["/api/reviews/check", orderId, productId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/reviews/check?orderId=${orderId}&productId=${productId}`);
        return response;
      } catch (error: any) {
        // If endpoint doesn't exist or review not found, return null
        if (error?.response?.status === 404) return null;
        throw error;
      }
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => 
      apiRequest("POST", "/api/reviews", {
        productId,
        orderId,
        rating,
        title,
        content,
        photos,
      }),
    onSuccess: () => {
      toast({ 
        title: "Review submitted", 
        description: "Thank you for your feedback!" 
      });
      setRating(0);
      setTitle("");
      setContent("");
      setPhotos([]);
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      // Redirect to order details page after successful submission
      setTimeout(() => {
        setLocation(`/orders/${orderId}`);
      }, 1000);
      onSuccess?.();
    },
  });

  const handlePhotoUpload = async () => {
    try {
      const response = await apiRequest("POST", "/api/reviews/photos/upload");
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handlePhotoComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful) {
      const newPhotos = result.successful.map((file) => file.uploadURL as string);
      setPhotos(prev => [...prev, ...newPhotos]);
      toast({
        title: "Photo uploaded",
        description: `${result.successful.length} photo(s) added to your review`,
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ 
        title: "Rating required", 
        description: "Please select a star rating",
        variant: "destructive" 
      });
      return;
    }
    submitMutation.mutate();
  };

  // Show loading state while checking for existing review
  if (checkingReview) {
    return (
      <Card className="glass-effect" data-testid="review-checking">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-zinc-400">Checking review status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show "Already reviewed" if review exists
  if (existingReview) {
    return (
      <Card className="glass-effect" data-testid="review-already-exists">
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Review Already Submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-zinc-400 mb-4">
            You have already submitted a review for this item.
          </p>
          <Button 
            onClick={() => setLocation(`/orders/${orderId}`)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            data-testid="button-back-to-order"
          >
            Back to Order Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (submitMutation.isPending) {
    return (
      <Card className="glass-effect" data-testid="review-submitting">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-zinc-400">Submitting your review...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect" data-testid="review-form">
      <CardHeader>
        <CardTitle className="text-white">Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rating *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                  data-testid={`star-${star}`}
                >
                  <Star
                    size={24}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "fill-red-600 text-red-600" 
                        : "text-zinc-600 hover:text-zinc-400"
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-zinc-400">
                {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Review Title
            </label>
            <Input
              placeholder="Summarize your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              data-testid="input-review-title"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Review
            </label>
            <Textarea
              placeholder="Tell other buyers about your experience with this item..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
              data-testid="textarea-review-content"
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Add Photos (optional)
            </label>
            <p className="text-sm text-zinc-400 mb-3">
              Share photos to help other buyers see how the item looks
            </p>
            
            {/* Photo Upload Button */}
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={5242880} // 5MB
              allowedFileTypes={['image/*']}
              onGetUploadParameters={handlePhotoUpload}
              onComplete={handlePhotoComplete as any}
              buttonClassName="bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600"
            >
              <Camera size={16} className="mr-2" />
              Add Photos ({photos.length}/5)
            </ObjectUploader>

            {/* Photo Preview Grid */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={convertImageUrl(photo)}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg bg-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`remove-photo-${index}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || submitMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700"
            data-testid="button-submit-review"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}