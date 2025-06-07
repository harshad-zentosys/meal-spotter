import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import Subscription from "@/models/Subscription";
import Mess from "@/models/Mess";
import razorpay from "@/lib/razorpay";

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

    const { messId, planName, planDescription, price, duration } =
      await request.json();

    // Validate required fields
    if (!messId || !planName || !price || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: messId, planName, price, duration" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify the mess exists
    const mess = await Mess.findById(messId);
    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

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

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration);

    // Create new subscription
    const newSubscription = new Subscription({
      userId: session.user.id,
      messId: messId,
      planName: planName,
      planDescription: planDescription || "",
      price: price,
      duration: duration,
      startDate: startDate,
      endDate: endDate,
      status: "created",
    });

    await newSubscription.save();

    // create razorpay subscription
    const options = {
      amount: price * 100,
      currency: "INR",
      receipt: `receipt_${newSubscription._id}`,
      notes: {
        subscriptionId: newSubscription._id,
      },
    };

    const razorpaySubscription = await razorpay.orders.create(options);

    // Populate the mess details for the response
    await newSubscription.populate(
      "messId",
      "name type location address contactNumber image"
    );

    return NextResponse.json(
      {
        success: true,
        subscription: newSubscription,
        razorpayOrderId: razorpaySubscription.id,
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
