import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Star, StarHalf, User, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewSectionProps {
  messId: string;
  canReview?: boolean; // Whether the current user can submit a review
}

export default function ReviewSection({
  messId,
  canReview = false,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/${messId}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      } else {
        console.error("Error fetching reviews:", data.error);
      }
    } catch (fetchError) {
      console.error("Error fetching reviews:", fetchError);
    } finally {
      setLoading(false);
    }
  }, [messId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) {
      setError("Please provide both rating and comment");
      return;
    }

    if (newReview.comment.length > 500) {
      setError("Comment must be less than 500 characters");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReview({ rating: 0, comment: "" });
        fetchReviews(); // Refresh reviews
      } else {
        setError(data.error || "Failed to submit review");
        toast.error(data.error || "Failed to submit review");
      }
    } catch (submitError) {
      setError("Error submitting review");
      toast.error("Error submitting review");
      console.error("Submit error:", submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingClick?: (rating: number) => void
  ) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      const halfFilled = i - 0.5 === rating;

      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingClick && onRatingClick(i)}
          className={`${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } transition-transform`}
        >
          {filled ? (
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ) : halfFilled ? (
            <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="h-5 w-5 text-gray-300" />
          )}
        </button>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews & Ratings
            </CardTitle>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-lg font-semibold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          {canReview && user?.role === "student" && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              size="sm"
            >
              Write Review
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Review Form */}
        {showReviewForm && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-4">Write Your Review</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(newReview.rating, true, (rating) =>
                    setNewReview((prev) => ({ ...prev, rating }))
                  )}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {newReview.rating > 0
                      ? `${newReview.rating} star${
                          newReview.rating !== 1 ? "s" : ""
                        }`
                      : "Select rating"}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment" className="text-sm font-medium">
                  Comment
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this mess..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="mt-2"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newReview.comment.length}/500 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  size="sm"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 0, comment: "" });
                    setError("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {review.userName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(review.createdAt)}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
