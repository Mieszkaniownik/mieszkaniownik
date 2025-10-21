import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: true,
    }),
  );

  app.enableCors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Accept",
      "Accept-Encoding",
      "Accept-Language",
      "Connection",
    ],
    exposedHeaders: ["Cache-Control", "Connection", "Content-Type"],
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (origin == null) {
        callback(null, true);
        return;
      }

      // Allow localhost with common development ports (3000-9999)
      const localhostPattern = /^https?:\/\/localhost:[3-9]\d{3}$/;
      // Allow local IP addresses with common development ports
      const ipPattern =
        /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:[3-9]\d{3}$/;

      // Build allowed domains list from environment variables
      const allowedDomains = [
        "http://localhost:5173",
        "http://localhost:5001",
        "http://mieszkaniownik-dev.local",
        "http://mieszkaniownik-prod.local",
      ];

      // Add FRONTEND_URL from environment if set
      const frontendUrl = process.env.FRONTEND_URL;
      if (frontendUrl !== undefined && frontendUrl !== "") {
        allowedDomains.push(frontendUrl, frontendUrl.replace(/\/$/, ""));
      }

      // Add production domains
      const productionDomains = [
        "https://mieszkaniownik.com",
        "https://www.mieszkaniownik.com",
        "https://dev.mieszkaniownik.com",
        "https://api.mieszkaniownik.com",
        "https://api-dev.mieszkaniownik.com",
      ];

      const allAllowedOrigins = [...allowedDomains, ...productionDomains];

      if (
        localhostPattern.test(origin) ||
        ipPattern.test(origin) ||
        allAllowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      // Log rejected origins in development for debugging
      if (process.env.NODE_ENV !== "production") {
        console.warn(`CORS blocked origin: ${origin}`);
      }

      callback(new Error("Not allowed by CORS"), false);
    },
    preflightContinue: false,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("API Mieszkaniownik")
    .setDescription(
      `Mieszkaniownik is a solution designed for students looking for an apartment or room to rent. With the current turnover of rental offers on platforms like OLX, every second counts. Why spend hours refreshing the website when you can simply create an alert, specify what kind of apartment you're interested in and your budget? Then, as soon as an offer appears, you'll receive a notification via email or Discord with all the most important information.`,
    )
    .setVersion("1.0")
    .addTag("api")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 5001);
}
void bootstrap();
