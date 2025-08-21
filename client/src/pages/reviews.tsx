import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare, ThumbsUp, Flag, Filter } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  buyerName: string;
  buyerAvatar?: string;
  productName: string;
  productSlug: string;
  productImage?: string;
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

function ReviewCard({ review, showProduct = true }: { review: Review; showProduct?: boolean }) {
  const { toast } = useToast();
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [response, setResponse] = useState("");

  const respondMutation = useMutation({
    mutationFn: async (responseText: string) => 
      apiRequest("POST", `/api/reviews/${review.id}/respond`, { response: responseText }),
    onSuccess: () => {
      toast({ title: "Response posted", description: "Your response has been added to the review" });
      setShowResponseDialog(false);
      setResponse("");
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
  });

  return (
    <Card className="glass-effect" data-testid={`review-card-${review.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
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
          <Button variant="ghost" size="sm" data-testid="button-report-review">
            <Flag size={16} />
          </Button>
        </div>

        {showProduct && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-900/50 rounded-lg">
            {review.productImage && (
              <img 
                src={review.productImage} 
                alt={review.productName}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <Link to={`/product/${review.productSlug}`}>
                <span className="font-medium text-white hover:text-red-400 transition-colors">
                  {review.productName}
                </span>
              </Link>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-medium text-white mb-2">{review.title}</h4>
          <p className="text-zinc-300 leading-relaxed">{review.content}</p>
        </div>

        {review.sellerResponse && (
          <div className="bg-zinc-900/50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-red-400" />
              <span className="font-medium text-white">Seller Response</span>
              <span className="text-sm text-zinc-400">
                {review.sellerResponseDate && new Date(review.sellerResponseDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-300">{review.sellerResponse}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ThumbsUp size={16} className="mr-2" />
              Helpful ({review.helpful})
            </Button>
          </div>

          {!review.sellerResponse && (
            <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-respond-review">
                  Respond
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Respond to Review</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Write your response to this review..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                    data-testid="textarea-review-response"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowResponseDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => respondMutation.mutate(response)}
                    disabled={!response.trim() || respondMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-submit-response"
                  >
                    Post Response
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/reviews", filter, sortBy],
  });

  const { data: reviewStats } = useQuery({
    queryKey: ["/api/reviews/stats"],
  });

  const reviewsArray = reviews as Review[] || [];
  const stats = reviewStats as {
    averageRating: number;
    totalReviews: number;
    positivePercentage: number;
    responseRate: number;
  } || {
    averageRating: 0,
    totalReviews: 0,
    positivePercentage: 0,
    responseRate: 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="reviews-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Reviews & Ratings</h1>
          <p className="text-zinc-400">Manage customer feedback and build your reputation</p>
        </div>

        {/* Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.averageRating?.toFixed(1) || "0.0"}
              </div>
              <StarRating rating={Math.round(stats.averageRating || 0)} size={20} />
              <p className="text-zinc-400 mt-2">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.totalReviews || 0}
              </div>
              <p className="text-zinc-400">Total Reviews</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.positivePercentage || 0}%
              </div>
              <p className="text-zinc-400">Positive Reviews</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.responseRate || 0}%
              </div>
              <p className="text-zinc-400">Response Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="glass-effect mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Filter size={20} className="text-zinc-400" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Reviews</SelectItem>
                    <SelectItem value="pending">Pending Response</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="5-star">5 Star</SelectItem>
                    <SelectItem value="4-star">4 Star</SelectItem>
                    <SelectItem value="3-star">3 Star</SelectItem>
                    <SelectItem value="2-star">2 Star</SelectItem>
                    <SelectItem value="1-star">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700">
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
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {reviewsArray.length > 0 ? (
          <div className="space-y-6" data-testid="reviews-list">
            {reviewsArray.map((review: Review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">⭐</div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">No Reviews Yet</h3>
              <p className="text-zinc-400 mb-6">
                Start selling to receive your first customer reviews and build your reputation.
              </p>
              <Link to="/seller/listings/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}