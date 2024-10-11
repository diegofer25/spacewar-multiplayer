import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            client: path.resolve(__dirname, './src'),
            server: path.resolve(__dirname, '../src'),
            'shared-configs': path.resolve(__dirname, '../shared-configs.json'),
        },
    },
});
