import { S3Client } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
    s3: S3Client | undefined;
};

export const s3 =
    globalForS3.s3 ??
    new S3Client({
        region: "us-east-1", // MinIO requires a region, even if dummy
        credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
            secretAccessKey: process.env.MINIO_SECRET_KEY || "password123",
        },
        endpoint: `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}`,
        forcePathStyle: true, // Required for MinIO
    });

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;
