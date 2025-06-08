import { NextRequest, NextResponse } from "next/server";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Get the file data from the request
    const fileData = await request.arrayBuffer();

    if (!fileData || fileData.byteLength === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const s3Service = new S3Service();
    const url = await s3Service.uploadFile(Buffer.from(fileData), filename);

    
    return NextResponse.json({
      url: url,
      downloadUrl: url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
