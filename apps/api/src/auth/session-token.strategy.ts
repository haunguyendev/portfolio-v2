import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";

/**
 * Validates Better Auth session tokens against the shared database.
 * The frontend sends the session token as Bearer token in Authorization header.
 * We look up the Session table to verify it's valid and not expired.
 */
@Injectable()
export class SessionTokenStrategy extends PassportStrategy(
  Strategy,
  "session-token",
) {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validate(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const token = authHeader.slice(7);
    if (!token) {
      throw new UnauthorizedException("Empty token");
    }

    // Look up session in shared database
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as Record<string, unknown>).role ?? "ADMIN",
    };
  }
}
