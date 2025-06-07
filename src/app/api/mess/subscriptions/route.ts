import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth-options";
import Subscription from "@/models/Subscription";
import Mess from "@/models/Mess";

// GET /api/mess/subscriptions - Get all subscriptions for the logged-in mess owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "mess-owner") {
      return NextResponse.json(
        { error: "Only mess owners can access this endpoint" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the mess owned by the current user
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json(
        { error: "Mess profile not found" },
        { status: 404 }
      );
    }

    // Find all subscriptions for this mess
    const subscriptions = await Subscription.find({ messId: mess._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active"
    ).length;
    const totalRevenue = subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => sum + sub.price, 0);

    return NextResponse.json({
      subscriptions,
      stats: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        revenue: totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Error fetching subscriptions" },
      { status: 500 }
    );
  }
}
