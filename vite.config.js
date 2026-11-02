import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  assetsInclude: ['**/*.glb'], // live 3D building models (Base3DLayer)
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    host: true,
    port: 3000
  }
});