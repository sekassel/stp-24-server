import {NestFactory} from '@nestjs/core';
import {Transport} from '@nestjs/microservices';
import {NestExpressApplication} from '@nestjs/platform-express';
import {WsAdapter} from '@nestjs/platform-ws';
import {SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {environment} from './environment';
import {ThrottlerExceptionFilter} from './util/throttler-exception.filter';
import {Handlers} from '@sentry/node';

import './polyfills';
import {Logger} from '@nestjs/common';

const globalPrefix = `api/${environment.version}`;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalFilters(new ThrottlerExceptionFilter());
  app.use(Handlers.tracingHandler());

  app.connectMicroservice({
    transport: Transport.NATS,
    options: environment.nats,
  });

  try {
    const swaggerDocs = require('../swagger.json');
    SwaggerModule.setup(globalPrefix, app, swaggerDocs);
  } catch (e) {
    console.error(e);
  }

  await app.listen(environment.port);
  await app.startAllMicroservices();

  new Logger('Main').log(`🚀 Server is running on ${environment.baseUrl}/${globalPrefix}`);
}

bootstrap();
