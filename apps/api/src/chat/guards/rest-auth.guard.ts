import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * REST-compatible auth guard using the session-token strategy.
 * Unlike JwtAuthGuard (which extracts req from GQL context),
 * this guard works with standard HTTP requests.
 */
@Injectable()
export class RestAuthGuard extends AuthGuard("session-token") {}
