import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: [
      "http://localhost:3000",
      process.env.CORS_ORIGIN,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();
