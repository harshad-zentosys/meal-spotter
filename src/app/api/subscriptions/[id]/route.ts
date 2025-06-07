import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth-options";
import Subscription from "@/models/Subscription";

// DELETE /api/subscriptions/[id] - Cancel/Unsubscribe from a subscription
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role === "mess-owner") {
      return NextResponse.json(
        { error: "Mess owners cannot unsubscribe from plans" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the subscription
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Check if the subscription belongs to the current user
    if (subscription.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only unsubscribe from your own subscriptions" },
        { status: 403 }
      );
    }

    // Check if subscription is already cancelled or expired
    if (subscription.status !== "active") {
      return NextResponse.json(
        { error: "Subscription is already cancelled or expired" },
        { status: 400 }
      );
    }

    // Update subscription status to cancelled
    subscription.status = "cancelled";
    await subscription.save();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully unsubscribed from the plan",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Error unsubscribing from the plan" },
      { status: 500 }
    );
  }
}
