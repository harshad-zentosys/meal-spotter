import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Mess from "@/models/Mess";
import Review from "@/models/Review"; 
import { PipelineStage } from "mongoose";

// GET /api/messes - Get all messes
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    console.log("lat", lat);
    console.log("lng", lng);
  
    const isGeoSearch = !isNaN(lat) && !isNaN(lng);
    let messes = [];

    if(isGeoSearch) {
      const geoMess = await Mess.aggregate([
        {
          $geoNear: {
            near: { type: "Point" as const, coordinates: [lng, lat] as [number, number] },
            distanceField: "distance",
            spherical: true,
            query: {
              location: { $exists: true, $ne: null },
            },
          },
        },
      ]).sort({ createdAt: -1 });

      const withoutGeoMess = await Mess.find({
        location: { $exists: false },
      }).sort({ createdAt: -1 });

      messes = [...geoMess, ...withoutGeoMess];
    } else {
      messes = await Mess.find({}).sort({ createdAt: -1 });
    }


    // Map the messes to include today's menu items and rating information
    const messesWithMenuAndRatings = await Promise.all(
      messes.map(async (mess: any) => {
        const todayMenu =
          mess.menu && mess.menu.length > 0
            ? mess.menu[mess.menu.length - 1].items
            : [];

        // Get rating information for this mess
        const reviews = await Review.find({ messId: mess._id });
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

        return {
          id: mess._id,
          name: mess.name,
          type: mess.type,
          location: mess.location,
          address: mess.address,
          contactNumber: mess.contactNumber,
          description: mess.description,
          cuisine: mess.cuisine,
          image:
            mess.image ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
          todayMenu: todayMenu,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          totalReviews: reviews.length,
        };
      })
    );

    if(isGeoSearch) console.log("messesWithMenuAndRatings", messesWithMenuAndRatings);

    return NextResponse.json(
      { messes: messesWithMenuAndRatings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messes:", error);
    return NextResponse.json(
      { error: "Error fetching messes" },
      { status: 500 }
    );
  }
}
