import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        globals: true,
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                url: "http://localhost",
            },
        },
    },
    // This ensures that the "graphql" package is resolved to the correct file, and not imported twice.
    resolve: {
        alias: {
            graphql: "graphql/index.js",
        },
    },
});
