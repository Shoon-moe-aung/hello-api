import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

function getImageExtension(mimeType) {
  const subtype = mimeType.split("/")[1] || "jpg";
  if (subtype.includes("+")) {
    return subtype.split("+")[0];
  }
  return subtype;
}

function parseDataUrlImage(dataUrl) {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  return {
    mimeType,
    buffer: Buffer.from(base64Data, "base64"),
  };
}

export async function POST(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBuffer;
    let imageMimeType;

    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      const file =
        formData.get("file") ||
        formData.get("image") ||
        formData.get("profileImage") ||
        formData.get("photo") ||
        formData.get("avatar");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { message: "No file uploaded" },
          { status: 400, headers: corsHeaders }
        );
      }

      if (!file.type || !file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Only image files allowed" },
          { status: 400, headers: corsHeaders }
        );
      }

      imageBuffer = Buffer.from(await file.arrayBuffer());
      imageMimeType = file.type;
    } else if (contentType.startsWith("application/json")) {
      const body = await req.json();
      const imageData = body?.image || body?.profileImage || body?.photo;
      if (!imageData || typeof imageData !== "string") {
        return NextResponse.json(
          { message: "No image payload found in request body" },
          { status: 400, headers: corsHeaders }
        );
      }

      const parsedDataUrl = parseDataUrlImage(imageData);
      if (!parsedDataUrl) {
        return NextResponse.json(
          { message: "Invalid image data format" },
          { status: 400, headers: corsHeaders }
        );
      }

      imageBuffer = parsedDataUrl.buffer;
      imageMimeType = parsedDataUrl.mimeType;
    } else {
      return NextResponse.json(
        { message: "Unsupported content type. Use multipart/form-data or JSON data URL" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!imageMimeType || !imageMimeType.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files allowed" },
        { status: 400, headers: corsHeaders }
      );
    }

    const ext = getImageExtension(imageMimeType);
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "profile-images");
    const savePath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(savePath, imageBuffer);

    const client = await getClientPromise();
    const db = client.db("wad-01");
    await db.collection("user").updateOne(
      { email: user.email },
      { $set: { profileImage: `/profile-images/${filename}` } }
    );

    return NextResponse.json(
      { imageUrl: `/profile-images/${filename}` },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error?.message || "Upload failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const email = user.email;
    const profile = await db.collection("user").findOne({ email });
    if (profile && profile.profileImage) {
      const normalizedImagePath = profile.profileImage.replace(/^\//, "");
      const filePath = path.join(process.cwd(), "public", normalizedImagePath);
      try {
        await fs.rm(filePath);
      } catch (err) {
        // File might not exist, ignore
      }
      await db.collection("user").updateOne(
        { email },
        { $set: { profileImage: null } }
      );
    }
    return NextResponse.json(
      { message: "OK" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: corsHeaders }
    );
  }
}
