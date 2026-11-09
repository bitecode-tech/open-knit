import {defineConfig} from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@identity": path.resolve(__dirname, "modules/identity"),
      "@document": path.resolve(__dirname, "modules/document"),
      "@common": path.resolve(__dirname, "modules/_common"),
    },
  },
  test: {
    environment: "node",
  },
});
