import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

/**
 * Custom throttler guard that extracts real client IP from Cloudflare headers.
 * Behind Cloudflare Tunnel, req.ip is the tunnel IP, not the actual client.
 */
@Injectable()
export class CloudflareThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const ip =
      (req.headers?.["cf-connecting-ip"] as string) ||
      (req.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "";
    return ip;
  }
}
