import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import Subscription from "@/models/Subscription";
import { emailService } from "@/lib/emailService";

// POST /api/subscriptions - Create a new subscription
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow students/users to create subscriptions
    if (session.user.role === "mess-owner") {
      return NextResponse.json(
        { error: "Mess owners cannot subscribe to plans" },
        { status: 403 }
      );
    }

    const { subscriptionId, messId } =
      await request.json();

    // Validate required fields
    if (!subscriptionId || !messId) {
      return NextResponse.json(
        { error: "Missing required fields: subscriptionId, messId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already has an active subscription to this mess
    const existingSubscription = await Subscription.findOne({
      userId: session.user.id,
      messId: messId,
      status: "active",
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription to this mess" },
        { status: 409 }
      );
    }


    const newSubscription = await Subscription.findByIdAndUpdate(subscriptionId, {
      status: "active",
    }, { new: true }).populate("messId");


    if (!newSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Send email to user
    const data = {
      userName: session.user.name || "User",
      messName: newSubscription.messId.name,
      planName: newSubscription.planName,
      planDescription: newSubscription.planDescription,
      price: newSubscription.price,
      duration: newSubscription.duration,
      startDate: newSubscription.startDate,
      endDate: newSubscription.endDate,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      email: session.user.email || "",
    }
    await emailService.sendPlanPurchaseEmail(
      session.user.name || "User",  
      newSubscription.messId.name,
      newSubscription.planName,
      newSubscription.planDescription,
      newSubscription.price,
      newSubscription.duration,
      newSubscription.startDate,
      newSubscription.endDate,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      session.user.email || "",
    );
    
    return NextResponse.json(
      {
        success: true,
        subscription: newSubscription,
        message: "Successfully subscribed to the mess plan!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Error creating subscription" },
      { status: 500 }
    );
  }
}
