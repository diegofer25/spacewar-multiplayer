import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import svgLoader from 'vite-svg-loader';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), svgLoader()],
    resolve: {
        alias: {
            client: path.resolve(__dirname, 'src'),
            server: path.resolve(__dirname, '../src'),
            'shared-configs': path.resolve(__dirname, '../shared-configs.json'),
        },
    },
});
