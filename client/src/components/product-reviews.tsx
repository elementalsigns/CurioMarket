import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import ReviewForm from "@/components/review-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductReviewsProps {
  productId: string;
  canReview?: boolean;
  orderId?: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  photos?: string[];
  createdAt: string;
  buyerName: string;
  buyerAvatar?: string;
  verified: boolean;
  helpful: number;
  sellerResponse?: string;
  sellerResponseDate?: string;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating 
              ? "fill-red-600 text-red-600" 
              : "text-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = review.content.length > 200;

  return (
    <Card className="glass-effect" data-testid={`product-review-${review.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={review.buyerAvatar} />
              <AvatarFallback className="bg-zinc-800 text-white">
                {review.buyerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{review.buyerName}</span>
                {review.verified && (
                  <Badge variant="secondary" className="bg-green-900/50 text-green-400 border-green-800">
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-sm text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {review.title && (
            <h4 className="font-medium text-white mb-2">{review.title}</h4>
          )}
          <p className="text-zinc-300 leading-relaxed">
            {needsExpansion && !expanded 
              ? review.content.slice(0, 200) + "..." 
              : review.content
            }
          </p>
          {needsExpansion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-red-400 hover:text-red-300 p-0 h-auto"
            >
              {expanded ? (
                <>Show less <ChevronUp size={16} className="ml-1" /></>
              ) : (
                <>Read more <ChevronDown size={16} className="ml-1" /></>
              )}
            </Button>
          )}
        </div>

        {/* Review Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {review.photos.map((photo, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover rounded-lg bg-zinc-800 hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {review.sellerResponse && (
          <div className="bg-zinc-900/50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-white">Seller Response</span>
              <span className="text-sm text-zinc-400">
                {review.sellerResponseDate && new Date(review.sellerResponseDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-300">{review.sellerResponse}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <ThumbsUp size={16} className="mr-2" />
            Helpful ({review.helpful})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingBreakdown({ stats }: { stats: any }) {
  const total = stats.totalReviews || 0;
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = stats.ratingBreakdown?.[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm text-zinc-400">{rating}</span>
              <Star size={14} className="fill-red-600 text-red-600" />
            </div>
            <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId, canReview = false, orderId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState("newest");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["/api/products", productId, "reviews", sortBy],
  });

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats || {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {},
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="product-reviews">
      {/* Review Summary */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} size={24} />
              <p className="text-zinc-400 mt-2">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div>
              <h4 className="font-medium text-white mb-4">Rating Distribution</h4>
              <RatingBreakdown stats={stats} />
            </div>
          </div>

          {/* Write Review Button */}
          {canReview && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-write-review"
              >
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && canReview && orderId && (
        <ReviewForm
          productId={productId}
          orderId={orderId}
          onSuccess={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Reviews ({stats.totalReviews})
              </CardTitle>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.map((review: Review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">⭐</div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">No Reviews Yet</h3>
            <p className="text-zinc-400 mb-6">
              Be the first to share your thoughts about this item.
            </p>
            {canReview && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}