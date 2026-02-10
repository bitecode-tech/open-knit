import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        flowbiteReact(),
        svgr()
    ],
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
            }
        }
    },
    server: {
        host: true
    },
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, 'src'),
            '@identity': path.resolve(__dirname, 'modules/identity'),
            '@ai': path.resolve(__dirname, 'modules/ai'),
            '@payment': path.resolve(__dirname, 'modules/payment'),
            '@transaction': path.resolve(__dirname, 'modules/transaction'),
            '@common': path.resolve(__dirname, 'modules/_common'),
        },
    },
});
