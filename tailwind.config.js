module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
        extend: {
            height: {
                "login-container": "calc(100vh - 2rem)",
                "content-docs-container": "calc(100vh - 9rem - 10px)",
            },
            width: {
                "content-container": "calc(100% - 24rem)",
                "editor-container": "calc(100% - (24rem + 24rem))",
            },
        },
    },
    presets: [require("@neo4j-ndl/base").tailwindConfig],
    // plugins: [],
    // Be sure to disable preflight,
    // as we provide our own Preflight (CSS Reset)
    // with Needle out of the box
    corePlugins: {
        preflight: false,
    },
    prefix: "",
};
