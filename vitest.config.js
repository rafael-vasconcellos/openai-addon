import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    timeout: 0, // Desativa o timeout globalmente
  },
});
