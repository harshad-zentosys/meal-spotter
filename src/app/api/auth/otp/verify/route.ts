import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, purpose } = await req.json();

    console.log("🔐 OTP Verification Request:", { email, otp, purpose });

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { error: "Email, OTP, and purpose are required" },
        { status: 400 }
      );
    }

    // Debug: Show current store contents
    otpStore.debug();

    // Get stored OTP
    const storedOTPData = otpStore.get(email);

    if (!storedOTPData) {
      console.log("❌ OTP lookup failed - not found or expired");
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    console.log("✅ OTP found, checking purpose and value...");

    // Check if purpose matches
    if (storedOTPData.purpose !== purpose) {
      console.log("❌ Purpose mismatch:", {
        stored: storedOTPData.purpose,
        requested: purpose,
      });
      return NextResponse.json(
        { error: "Invalid OTP purpose" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      console.log("❌ OTP mismatch:", {
        stored: storedOTPData.otp,
        provided: otp,
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    console.log(
      "✅ OTP verified successfully! Keeping in storage for account creation."
    );

    // DON'T delete OTP here - keep it for the final signup step
    // The signup endpoint will delete it after successful account creation

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
