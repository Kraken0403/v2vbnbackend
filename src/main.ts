import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

function getCorsOrigins(): string[] {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3007',
  ]

  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []

  const frontendUrl = process.env.FRONTEND_URL?.trim()

  return Array.from(
    new Set([
      ...defaultOrigins,
      ...envOrigins,
      ...(frontendUrl ? [frontendUrl] : []),
    ]),
  )
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOrigins = getCorsOrigins()

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests, curl, Swagger, mobile apps, etc.
      if (!origin) {
        return callback(null, true)
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false)
    },
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

  const port = Number(process.env.PORT || 5000)

  await app.listen(port)

  console.log(`✅ API running on http://localhost:${port}`)
  console.log(`📘 Swagger running on http://localhost:${port}/api-docs`)
  console.log(`🌐 Allowed CORS origins:`)
  corsOrigins.forEach((origin) => console.log(`   - ${origin}`))
}

bootstrap()
