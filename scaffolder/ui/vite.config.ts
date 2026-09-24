import {defineConfig} from "vite";
import path from "path";
import {readFileSync} from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

const {version: scaffolderVersion} = JSON.parse(
    readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
) as {version: string};

export default defineConfig({
    plugins: [tailwindcss(), react(), vike()],
    define: {
        __SCAFFOLDER_VERSION__: JSON.stringify(scaffolderVersion)
    },
    resolve: {
        alias: {
            "@app": path.resolve(__dirname, "src")
        }
    },
    build: {
        target: "es2020"
    }
});
