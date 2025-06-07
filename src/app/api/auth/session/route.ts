import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session in session route:", JSON.stringify(session, null, 2));

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
