import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:3000', // Nuxt dev
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('V2VBN API')
    .setDescription('V2VBN backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()

  const swaggerDocumentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api-docs', app, swaggerDocumentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT || 5000

  await app.listen(port)

  console.log(`✅ API running on http://localhost:${port}`)
  console.log(`📘 Swagger running on http://localhost:${port}/api-docs`)
}

bootstrap()