import { defineConfig } from 'vite';

const proxy = {
    '/counter': 'http://localhost:3000'
};

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: '@netxpert/jsx'
    },
    server: { proxy },
    preview: { proxy }
});
