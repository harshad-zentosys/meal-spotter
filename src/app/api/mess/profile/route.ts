import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth-options";
import Mess from "@/models/Mess";
import User from "@/models/User";
import { put } from "@vercel/blob";

// GET /api/mess/profile - Get the mess profile for the logged-in mess owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "mess-owner") {
      return NextResponse.json(
        { error: "Only mess owners can access this endpoint" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find mess by owner ID
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json(
        { error: "Mess profile not found", redirectToSetup: true },
        { status: 404 }
      );
    }

    return NextResponse.json({ mess }, { status: 200 });
  } catch (error) {
    console.error("Error fetching mess profile:", error);
    return NextResponse.json(
      { error: "Error fetching mess profile" },
      { status: 500 }
    );
  }
}

// PUT /api/mess/profile - Update the mess profile for the logged-in mess owner
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user || user.role !== "mess-owner") {
      return Response.json(
        { error: "Only mess owners can update profiles" },
        { status: 403 }
      );
    }

    // Check if this is a FormData request (for file uploads) or JSON request
    const contentType = request.headers.get("content-type");
    const isFormData = contentType?.includes("multipart/form-data");
    const isJSON = contentType?.includes("application/json");

    let name,
      type,
      cuisine,
      lat,
      lng,
      address,
      contactNumber,
      description,
      plans,
      menu,
      itemsIndex,
      imageFile;

    if (isFormData) {
      // Handle FormData (file uploads)
      const formData = await request.formData();

      name = formData.get("name") as string;
      type = formData.get("type") as string;
      const cuisineStr = formData.get("cuisine") as string;
      lat = formData.get("lat") as string;
      lng = formData.get("lng") as string;
      address = formData.get("address") as string;
      contactNumber = formData.get("contactNumber") as string;
      description = formData.get("description") as string;
      const plansStr = formData.get("plans") as string;
      const menuStr = formData.get("menu") as string;
      const itemsIndexStr = formData.get("itemsIndex") as string;
      imageFile = formData.get("image") as File | null;

      try {
        cuisine = cuisineStr ? JSON.parse(cuisineStr) : undefined;
        plans = plansStr ? JSON.parse(plansStr) : undefined;
        menu = menuStr ? JSON.parse(menuStr) : undefined;
        itemsIndex = itemsIndexStr ? JSON.parse(itemsIndexStr) : undefined;
      } catch (parseError) {
        console.error("Error parsing JSON data in FormData:", parseError);
        return Response.json(
          { error: "Invalid JSON data in FormData" },
          { status: 400 }
        );
      }
    } else if (isJSON) {
      // Handle JSON data (simple updates)
      const body = await request.json();

      name = body.name;
      type = body.type;
      cuisine = body.cuisine;
      lat = body.lat;
      lng = body.lng;
      address = body.address;
      contactNumber = body.contactNumber;
      description = body.description;
      plans = body.plans;
      menu = body.menu;
      itemsIndex = body.itemsIndex;
      // No image file in JSON requests
      imageFile = null;
    } else {
      return Response.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }


    await connectToDatabase();

    // Check if the mess profile already exists
    let mess = await Mess.findOne({ ownerId: user._id });
    let imageUrl = mess?.image; // Keep existing image by default

    // Handle image upload if provided (only for FormData requests)
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();

        // Create unique filename
        const filename = `mess-${user._id}-${Date.now()}-${imageFile.name}`;

        // Upload to Vercel Blob
        const blob = await put(filename, bytes, {
          access: "public",
        });

        imageUrl = blob.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        return Response.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    if (mess) {
      // Update existing mess - only update fields that are provided
      if (name !== undefined) mess.name = name;
      if (type !== undefined) mess.type = type;
      if (cuisine !== undefined) mess.cuisine = cuisine;
      if (lat !== undefined) mess.lat = lat;
      if (lng !== undefined) mess.lng = lng;
      if (address !== undefined) mess.address = address;
      if (contactNumber !== undefined) mess.contactNumber = contactNumber;
      if (description !== undefined) mess.description = description;
      if (imageUrl !== undefined) mess.image = imageUrl;

      // Update plans if provided
      if (plans !== undefined) {
        mess.plans = plans;
      }

      // Update menu if provided
      if (menu !== undefined) {
        console.log("=== MENU UPDATE DEBUG ===");
        console.log("Received menu data:", JSON.stringify(menu, null, 2));
        console.log(
          "Menu items with prices:",
          menu.map(
            (day: {
              date: string;
              items: { name: string; price?: number }[];
            }) => ({
              date: day.date,
              items: day.items.map(
                (item: { name: string; price?: number }) => ({
                  name: item.name,
                  price: item.price,
                  hasPrice: typeof item.price === "number",
                })
              ),
            })
          )
        );
        console.log("=== END DEBUG ===");
        mess.menu = menu;
      }

      // Update itemsIndex if provided
      if (itemsIndex !== undefined) {
        console.log("=== ITEMS INDEX UPDATE DEBUG ===");
        console.log(
          "Received itemsIndex data:",
          JSON.stringify(itemsIndex, null, 2)
        );
        console.log("=== END DEBUG ===");
        mess.itemsIndex = itemsIndex;
      }

      await mess.save();
    } else {
      // Create new mess - require essential fields
      if (!name || !lat || !lng || !address) {
        return Response.json(
          {
            error:
              "Name, location, and address are required for new mess profile",
          },
          { status: 400 }
        );
      }

      mess = new Mess({
        ownerId: user._id,
        name,
        type,
        cuisine,
        lat,
        lng,
        address,
        contactNumber,
        description,
        image: imageUrl,
        plans: plans || [],
        menu: menu || [],
        itemsIndex: itemsIndex || [],
      });

      await mess.save();
    }

    return Response.json({ success: true, mess });
  } catch (error) {
    console.error("Error updating mess profile:", error);
    return Response.json(
      { error: "Error updating mess profile" },
      { status: 500 }
    );
  }
}
