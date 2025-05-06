import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.TEMP_ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.TEMP_SECRET_ACCESS_KEY_AWS!,
  },
});
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = `users_uploaded_files/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: "pptgen-public-v2",
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const url = `https://s3.ap-south-1.amazonaws.com/pptgen-public-v2/${fileKey}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
