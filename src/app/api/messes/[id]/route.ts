import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Mess from "@/models/Mess";

interface MenuItem {
  id: string;
  name: string;
  type: string;
  image?: string;
}

interface MenuDay {
  date: Date;
  items: MenuItem[];
}

// GET /api/messes/[id] - Get a specific mess by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mess ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find mess by ID
    const mess = await Mess.findById(id);

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Format the response
    const messWithDetails = {
      id: mess._id,
      name: mess.name,
      type: mess.type,
      location: mess.location,
      address: mess.address,
      contactNumber: mess.contactNumber,
      description: mess.description || "",
      cuisine: mess.cuisine || [],
      image:
        mess.image ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
      plans: mess.plans || [],
      menu:
        mess.menu?.map((menuItem: MenuDay) => ({
          date: menuItem.date,
          items: menuItem.items,
        })) || [],
    };

    return NextResponse.json({ mess: messWithDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching mess by ID:", error);
    return NextResponse.json(
      { error: "Error fetching mess details" },
      { status: 500 }
    );
  }
}
