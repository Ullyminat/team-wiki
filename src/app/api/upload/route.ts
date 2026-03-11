import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = file.name.split(".").pop() || "bin";
        const fileName = `${uuidv4()}.${fileExtension}`;
        const bucketName = process.env.MINIO_BUCKET_NAME || "team-wiki-storage";

        // Auto-create bucket if it doesn't exist
        try {
            await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`[MinIO] Ensured bucket '${bucketName}' exists.`);
        } catch (e: any) {
            if (e.name !== "BucketAlreadyOwnedByYou" && e.name !== "BucketAlreadyExists") {
                console.warn(`[MinIO] Bucket check warning:`, e);
            }
        }

        console.log(`[Upload] Processing file: ${file.name} -> ${fileName}`);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: file.type || "application/octet-stream",
        });

        await s3.send(command);

        // In production Docker, use the endpoint that the client can resolve (often the same as host)
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const fileUrl = `${baseUrl}/api/files/${fileName}`; // Proxying through app for better SSL/CORS handling

        return NextResponse.json({
            url: fileUrl,
            name: fileName,
            originalName: file.name
        });
    } catch (error) {
        console.error("Critical error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
