import { NextResponse } from "next/server";
import { otpStore } from "@/lib/otpStore";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 403 }
    );
  }

  otpStore.debug();

  return NextResponse.json(
    {
      message: "Check console for OTP store contents",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function DELETE() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 403 }
    );
  }

  otpStore.clear();

  return NextResponse.json(
    {
      message: "OTP store cleared",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
