import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [
      react(),
      // Ensure static assets used by fetch() are copied to the build folder
      viteStaticCopy({
        targets: [
          { src: 'releases', dest: '.' },
          { src: 'assets', dest: '.' }
        ]
      })
    ],
    // Polyfill process.env for the Gemini SDK and Application code
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});