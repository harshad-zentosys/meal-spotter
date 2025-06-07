import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";

// GET /api/reviews/[messId] - Get all reviews for a specific mess
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messId: string }> }
) {
  try {
    const { messId } = await params;

    if (!messId) {
      return NextResponse.json(
        { error: "Mess ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch reviews for this mess with user details
    const reviews = await Review.find({ messId })
      .populate({
        path: "userId",
        select: "name", // Only select the name field from User
        model: User,
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return NextResponse.json(
      {
        reviews: reviews.map((review) => ({
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          userName: review.userId?.name || "Anonymous",
          createdAt: review.createdAt,
        })),
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Error fetching reviews" },
      { status: 500 }
    );
  }
}
