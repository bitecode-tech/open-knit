import {defineConfig} from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

export default defineConfig({
    plugins: [tailwindcss(), react(), vike()],
    resolve: {
        alias: {
            "@app": path.resolve(__dirname, "src")
        }
    },
    build: {
        target: "es2020"
    }
});
