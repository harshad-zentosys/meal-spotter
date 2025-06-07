import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth-options";
import Subscription from "@/models/Subscription";

// GET /api/user/subscriptions - Get all subscriptions for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow students/users (not mess-owners) to access this endpoint
    if (session.user.role === "mess-owner") {
      return NextResponse.json(
        { error: "This endpoint is for students/users only" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find all subscriptions for this user
    const subscriptions = await Subscription.find({ userId: session.user.id })
      .populate(
        "messId",
        "name type cuisine location address contactNumber image"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active"
    ).length;
    const expiredSubscriptions = subscriptions.filter(
      (sub) => sub.status === "expired"
    ).length;
    const totalSpent = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

    return NextResponse.json({
      subscriptions,
      stats: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return NextResponse.json(
      { error: "Error fetching subscriptions" },
      { status: 500 }
    );
  }
}
