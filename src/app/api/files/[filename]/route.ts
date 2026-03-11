import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const bucketName = process.env.MINIO_BUCKET_NAME || "team-wiki-storage";

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: filename,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Transform stream to readable
        const stream = response.Body as any;

        return new NextResponse(stream, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Error serving file", { status: 500 });
    }
}
