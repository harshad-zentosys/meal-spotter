import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

// Hardcoded admin creation secret - only for development!
// In production, use a more secure method
const ADMIN_SECRET = "MEALSPOTTER-ADMIN-SECRET";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, secret } = await req.json();

    // Check if the admin secret is valid
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid secret key" },
        { status: 401 }
      );
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await user.save();

    // Return success response without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during admin registration" },
      { status: 500 }
    );
  }
}
