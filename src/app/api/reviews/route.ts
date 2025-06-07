import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import Review from "@/models/Review";
import Subscription from "@/models/Subscription";

// POST /api/reviews - Create a new review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can submit reviews" },
        { status: 403 }
      );
    }

    const { messId, rating, comment } = await req.json();

    if (!messId || !rating || !comment) {
      return NextResponse.json(
        { error: "Mess ID, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: "Comment must be less than 500 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user has an active subscription to this mess
    const activeSubscription = await Subscription.findOne({
      userId: session.user.id,
      messId: messId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "You can only review messes you are currently subscribed to" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this mess
    const existingReview = await Review.findOne({
      userId: session.user.id,
      messId: messId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this mess" },
        { status: 409 }
      );
    }

    // Create the review
    const review = new Review({
      userId: session.user.id,
      messId: messId,
      rating: rating,
      comment: comment,
    });

    await review.save();

    return NextResponse.json(
      { message: "Review submitted successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Error submitting review" },
      { status: 500 }
    );
  }
}
