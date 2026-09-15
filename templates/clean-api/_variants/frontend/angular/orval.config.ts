import { defineConfig } from 'orval';

const openApiUrl = process.env['OPENAPI_URL'] ?? 'http://localhost:5000/openapi/v1.json';

export default defineConfig({
  templateApp: {
    input: { target: openApiUrl },
    output: {
      mode: 'tags-split',
      target: './src/app/core/api/generated/api.ts',
      schemas: './src/app/core/api/generated/models',
      client: 'angular',
      httpClient: 'angular',
      clean: true
    }
  }
});
