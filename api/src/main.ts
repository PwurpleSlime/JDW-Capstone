import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  let port = process.env.PORT ?? 3000
  console.log(port)
  const config = new DocumentBuilder()
  .setTitle("Jaydee White's Capstone API docs")
  .setDescription("API Documentation")
  .setVersion("1.0")
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    in: 'header'
  }, 'access-token') 
  .build()

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true
  });
  SwaggerModule.setup('/api-docs', app, document, {
    customSiteTitle: 'Capstone API docs',
    swaggerOptions: {
      url: '/api-docs-json', 
    },
    customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(port);
}

bootstrap();
