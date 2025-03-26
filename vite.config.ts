import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    // This ensures that the "graphql" package is resolved to the correct file, and not imported twice.
    resolve: {
        alias: {
            graphql: "graphql/index.js",
        },
    },
    plugins: [react()],
});
