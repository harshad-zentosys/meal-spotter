import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import Mess from "@/models/Mess";

// Define types
interface MenuDay {
  date: Date;
  items: Array<{
    id: string;
    name: string;
    type: string;
    image?: string;
  }>;
}

interface MenuItem {
  id: string;
  name: string;
  type: string;
  image?: string;
}

// Get menu for a mess
export async function GET() {
  try {
    // Get current user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Get the mess owned by the current user
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Return the menu
    return NextResponse.json({
      menu: mess.menu || [],
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update menu for a mess
export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "mess-owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { menu } = await req.json();

    if (!menu || !Array.isArray(menu)) {
      return NextResponse.json({ error: "Invalid menu data" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Get the mess owned by the current user
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Update the menu
    mess.menu = menu;
    await mess.save();

    return NextResponse.json({
      message: "Menu updated successfully",
      menu: mess.menu,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add menu item
export async function PUT(req: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "mess-owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, item } = await req.json();

    if (!date || !item || !item.name || !item.type) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Get the mess owned by the current user
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Find the menu for the given date or create a new one
    let menuDay = mess.menu.find(
      (m: MenuDay) =>
        new Date(m.date).toDateString() === new Date(date).toDateString()
    );

    if (!menuDay) {
      // Create a new menu day if it doesn't exist
      menuDay = {
        date: new Date(date),
        items: [],
      };
      mess.menu.push(menuDay);
    }

    // Add item to menu
    menuDay.items.push({
      ...item,
      id: new Date().getTime().toString(), // Simple ID generation
    });

    await mess.save();

    return NextResponse.json({
      message: "Item added successfully",
      menu: mess.menu,
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete menu item
export async function DELETE(req: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "mess-owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const itemId = searchParams.get("itemId");

    if (!dateParam || !itemId) {
      return NextResponse.json(
        { error: "Date and itemId are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get the mess owned by the current user
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Find the menu for the given date
    const menuIndex = mess.menu.findIndex(
      (m: MenuDay) =>
        new Date(m.date).toDateString() === new Date(dateParam).toDateString()
    );

    if (menuIndex === -1) {
      return NextResponse.json(
        { error: "Menu not found for the specified date" },
        { status: 404 }
      );
    }

    // Remove the item
    mess.menu[menuIndex].items = mess.menu[menuIndex].items.filter(
      (item: MenuItem) => item.id !== itemId
    );

    // If no items left for that day, remove the entire day
    if (mess.menu[menuIndex].items.length === 0) {
      mess.menu.splice(menuIndex, 1);
    }

    await mess.save();

    return NextResponse.json({
      message: "Item deleted successfully",
      menu: mess.menu,
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
