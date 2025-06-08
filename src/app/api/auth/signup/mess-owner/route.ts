import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Mess from "@/models/Mess";
import { hash } from "bcrypt";
import { otpStore } from "@/lib/otpStore";
import { put } from "@vercel/blob";
import { S3Service } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const otp = formData.get("otp") as string;
    const imageFile = formData.get("image") as File | null;

    console.log("👤 Mess Owner Signup Request:", {
      name,
      email,
      otp: otp ? "***" : "missing",
      hasImage: !!imageFile,
    });

    // Validate input
    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { error: "Name, email, password, and OTP are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Debug: Show current store contents before verification
    console.log("📊 OTP Store before verification:");
    otpStore.debug();

    // Verify OTP first
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      console.log(
        "❌ OTP not found during signup - this should not happen if verification worked"
      );
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    console.log("✅ OTP found during signup, checking details...");

    if (storedOTPData.purpose !== "mess-owner-signup") {
      console.log("❌ OTP purpose mismatch during signup:", {
        stored: storedOTPData.purpose,
        expected: "mess-owner-signup",
      });
      return NextResponse.json(
        { error: "Invalid OTP for mess owner signup" },
        { status: 400 }
      );
    }

    if (storedOTPData.otp !== otp) {
      console.log("❌ OTP value mismatch during signup:", {
        stored: storedOTPData.otp,
        provided: otp,
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    console.log(
      "✅ OTP re-verified successfully during signup, proceeding with account creation..."
    );

    // OTP verified, proceed with account creation
    await connectToDatabase();

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "mess-owner",
    });

    await newUser.save();
    console.log("✅ User created successfully");

    // Handle image upload if provided
    let imageUrl = undefined;
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();

        // Create unique filename
        const filename = `mess-${newUser._id}-${Date.now()}-${imageFile.name}`;

        const s3Service = new S3Service();
        imageUrl = await s3Service.uploadFile(Buffer.from(bytes), filename);
        console.log("✅ Image uploaded successfully:", imageUrl);
      } catch (error) {
        console.error("Error uploading image during signup:", error);
        // Don't fail the signup if image upload fails, just continue without image
      }
    }

    // Create a minimal mess profile - details can be added later
    const newMess = new Mess({
      ownerId: newUser._id,
      name: name + "'s Mess", // Default name based on owner
      type: "both",
      cuisine: [],
      address: "To be updated", // Placeholder
      contactNumber: "",
      image: imageUrl,
      plans: [],
      menu: [],
    });

    await newMess.save();
    console.log("✅ Mess profile created successfully");

    // NOW remove OTP from storage after successful signup
    otpStore.delete(email);
    console.log("🗑️ OTP deleted after successful account creation");

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in mess owner signup route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
