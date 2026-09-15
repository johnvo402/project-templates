import { defineConfig } from 'orval';

const openApiUrl = process.env.OPENAPI_URL ?? 'http://localhost:5000/openapi/v1.json';

export default defineConfig({
  templateApp: {
    input: { target: openApiUrl },
    output: {
      mode: 'tags-split',
      target: './src/core/api/generated/api.ts',
      schemas: './src/core/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: './src/core/api/custom-fetch.ts',
          name: 'customFetch'
        }
      }
    }
  }
});
