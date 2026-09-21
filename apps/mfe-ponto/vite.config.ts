import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// Cada MFE é uma aplicação independente: build, teste e deploy próprios.
// Expõe apenas o contrato `mount` — o shell não conhece nada do React interno.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfePonto',
      filename: 'remoteEntry.js',
      exposes: {
        './mount': './src/mount.tsx',
      },
      shared: {
        // react-dom fica fora do shared: o proxy de dev do plugin resolve
        // react-dom/client para um chunk sem __SECRET_INTERNALS e quebra o
        // entry standalone. Cada remote embute seu react-dom (~140KB); o que
        // precisa ser singleton e o react (dispatcher de hooks/context).
        react: { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:5001',
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
});
