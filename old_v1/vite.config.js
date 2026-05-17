import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'nlfro-154-192-22-68.run.pinggy-free.link',
      '.pinggy-free.link'
    ]
  }
});
