import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => 
      apiRequest("POST", "/api/reviews", {
        productId,
        orderId,
        rating,
        title,
        content,
      }),
    onSuccess: () => {
      toast({ 
        title: "Review submitted", 
        description: "Thank you for your feedback!" 
      });
      setRating(0);
      setTitle("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      onSuccess?.();
    },
  });

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