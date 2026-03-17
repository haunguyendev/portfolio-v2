import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Auth guard for REST endpoints (non-GraphQL).
 * Uses the same session-token strategy but without GQL context extraction.
 * The default AuthGuard passes the plain HTTP request to the strategy.
 */
@Injectable()
export class RestAuthGuard extends AuthGuard("session-token") {}
