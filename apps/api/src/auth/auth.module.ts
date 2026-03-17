import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { SessionTokenStrategy } from "./session-token.strategy";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PassportModule, PrismaModule],
  providers: [SessionTokenStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
