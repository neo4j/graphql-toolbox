/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly NEO4J_GRAPHQL_VERSION: string;
    readonly SEGMENT_GRAPHQL_TOOLBOX_PROD_SOURCE: string;
    readonly CANNY_GRAPHQL_TOOLBOX_APP_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
