import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: S3Client;
  private bucket: string;

  onModuleInit() {
    const endpoint = process.env.MINIO_ENDPOINT || "localhost";
    const port = process.env.MINIO_PORT || "9000";
    const useSSL = process.env.MINIO_USE_SSL === "true";
    const protocol = useSSL ? "https" : "http";

    this.bucket = process.env.MINIO_BUCKET || "portfolio-media";
    this.client = new S3Client({
      endpoint: `${protocol}://${endpoint}:${port}`,
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || "minioadmin",
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`Connected to MinIO at ${protocol}://${endpoint}:${port}`);
  }

  /** Upload a buffer to MinIO */
  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  /** Get object as readable stream with metadata */
  async getObject(
    key: string,
  ): Promise<{ stream: Readable; contentType: string; size: number; etag: string }> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || "image/webp",
      size: response.ContentLength || 0,
      etag: response.ETag || "",
    };
  }

  /** Delete an object from MinIO */
  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /** Get object metadata (ETag, size) without downloading */
  async headObject(
    key: string,
  ): Promise<{ etag: string; size: number; contentType: string }> {
    const response = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    return {
      etag: response.ETag || "",
      size: response.ContentLength || 0,
      contentType: response.ContentType || "image/webp",
    };
  }
}
