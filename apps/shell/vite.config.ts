import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// O shell é host de Module Federation, mas NÃO declara remotes no build:
// eles são registrados em runtime a partir do manifest do BFF
// (Plugin Registry Pattern) — adicionar um MFE nunca exige rebuild do shell.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portalShell',
      remotes: {},
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});
