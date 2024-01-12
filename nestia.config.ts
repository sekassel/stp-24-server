import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import {environment} from './src/environment';
import {AppModule} from './src/app.module';

export default {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(`api/${environment.version}`);
    return app;
  },
  swagger: {
    output: "dist/swagger.json",
    beautify: true,
    security: {
      bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    servers: [
      {
        url: environment.baseUrl,
        description: "Local Server"
      }
    ],
  }
} satisfies INestiaConfig;
