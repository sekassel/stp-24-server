import {INestiaConfig} from '@nestia/sdk';
import {NestFactory} from '@nestjs/core';

import {environment} from './src/environment';
import {AppModule} from './src/app.module';
import {readFileSync} from 'fs';

function loadDescription(): string {
  return [
    'REST',
    'WebSocket',
    'Changelog',
  ]
    .map(fileName => {
      const content = readFileSync(`docs/${fileName}.md`).toString();
      const replacedContent = content
        .replace(/\$\{environment\.(\w+)}/g, (_, key) => (environment as any)[key])
        .replace(/\$\{environment\.(\w+)\.(\w+)}/g, (_, category, key) => (environment as any)[category]?.[key]);
      return `
<details><summary>${fileName}</summary>

${replacedContent}

</details>
`;
    })
    .join('\n');
}

export default {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(`api/${environment.version}`);
    return app;
  },
  swagger: {
    output: 'dist/swagger.json',
    beautify: true,
    info: {
      title: 'STP Server',
      description: loadDescription(),
      version: environment.version,
    },
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    servers: [
      {
        url: environment.baseUrl,
        description: 'Local Server',
      },
    ],
  },
} satisfies INestiaConfig;
