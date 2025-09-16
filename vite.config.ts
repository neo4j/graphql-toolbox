import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        nodePolyfills({
            include: ["process"],
        }),
    ],
    define: {
        "import.meta.env.NEO4J_GRAPHQL_VERSION": JSON.stringify(
            packageJson.dependencies?.["@neo4j/graphql"] ?? packageJson.devDependencies?.["@neo4j/graphql"]
        ),
    },
});
