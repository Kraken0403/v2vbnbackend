import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', // Nuxt dev
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,          // ✅ REQUIRED
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  

  await app.listen(process.env.PORT || 5000);
  console.log(`✅ API running on http://localhost:${process.env.PORT || 5000}`);
}
bootstrap();
