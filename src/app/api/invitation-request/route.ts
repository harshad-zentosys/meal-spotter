import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import InvitationRequest from "@/models/InvitationRequest";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, messName, address } = body;

    // Validate required fields
    if (!name || !email || !phone || !messName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if this email already has a pending request
    const existingRequest = await InvitationRequest.findOne({ email });

    if (existingRequest) {
      return NextResponse.json(
        { message: "You already have a pending invitation request" },
        { status: 400 }
      );
    }

    // Create a new invitation request
    const invitationRequest = new InvitationRequest({
      name,
      email,
      phone,
      messName,
      address,
      status: "pending",
      createdAt: new Date(),
    });

    await invitationRequest.save();

    // Notify admin about the new request (you can customize this)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@meal-spotter.com",
      subject: "New Mess Owner Invitation Request",
      html: `A new mess owner has requested an invitation:
        
Name: ${name}
Mess Name: ${messName}
Email: ${email}
Phone: ${phone}
Address: ${address}

Please review this request in the admin dashboard.`,
    });

    // Send confirmation email to the requester
    await sendEmail({
      to: email,
      subject: "Your Meal Spotter Invitation Request",
      html: `Dear ${name},

Thank you for your interest in joining Meal Spotter as a mess owner. We have received your request and will review it shortly.

Once approved, we will send you an invitation code to the email address you provided (${email}).

Details of your request:
- Mess Name: ${messName}
- Phone: ${phone}
- Address: ${address}

If you have any questions, please reply to this email.

Best regards,
The Meal Spotter Team`,
    });

    return NextResponse.json(
      { message: "Invitation request submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation request:", error);
    return NextResponse.json(
      { message: "Error processing your request" },
      { status: 500 }
    );
  }
}
