import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { otpStore, generateOTP } from "@/lib/otpStore";
import { emailService } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();

    console.log("📧 OTP Send Request:", { email, purpose });

    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // For new mess owner signup, check if email already exists
    if (purpose === "mess-owner-signup") {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    console.log("🔑 Generated OTP:", {
      email,
      otp,
      purpose,
      expiresAt: new Date(expiresAt).toISOString(),
    });

    // Store OTP
    otpStore.set(email, { otp, expiresAt, purpose });

    // Verify it was stored correctly
    const verification = otpStore.get(email);
    console.log("✅ OTP Storage Verification:", {
      stored: !!verification,
      storedOTP: verification?.otp,
      storedPurpose: verification?.purpose,
    });

    // Send OTP via email
    const sent = await emailService.sendOTPEmail(email, otp, purpose);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        // Always return the OTP for easy testing
        // NOTE: In a real production app with actual email service,
        // you might want to remove this for security
        otp: otp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
