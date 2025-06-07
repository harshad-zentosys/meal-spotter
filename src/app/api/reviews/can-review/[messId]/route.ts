import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth-options";
import Subscription from "@/models/Subscription";
import Review from "@/models/Review";

// GET /api/reviews/can-review/[messId] - Check if user can review a mess
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { canReview: false, reason: "Authentication required" },
        { status: 200 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { canReview: false, reason: "Only students can review messes" },
        { status: 200 }
      );
    }

    const { messId } = await params;

    if (!messId) {
      return NextResponse.json(
        { canReview: false, reason: "Mess ID is required" },
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
        {
          canReview: false,
          reason: "You must have an active subscription to review this mess",
        },
        { status: 200 }
      );
    }

    // Check if user has already reviewed this mess
    const existingReview = await Review.findOne({
      userId: session.user.id,
      messId: messId,
    });

    if (existingReview) {
      return NextResponse.json(
        { canReview: false, reason: "You have already reviewed this mess" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { canReview: true, reason: "You can review this mess" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { canReview: false, reason: "Error checking eligibility" },
      { status: 500 }
    );
  }
}
