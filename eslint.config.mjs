// @ts-check

import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

const ignores = [
    "**/dist",
    "**/node_modules",
    "**/docs",
    "**/examples",
    "playwright.config.ts",
    "**/coverage/lcov-report",
    "eslint.config.mjs",
];

export default [
    { ignores },
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    reactPlugin.configs.flat.recommended,
    prettierRecommended,
    {
        files: ["**/*.{jsx,tsx}"],
        ...jsxA11y.flatConfigs.recommended,
        plugins: {
            "jsx-a11y": jsxA11y,
            "react-hooks": hooksPlugin,
        },
        languageOptions: {
            ...jsxA11y.flatConfigs.recommended.languageOptions,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "jsx-a11y/no-autofocus": "off",
            "react/react-in-jsx-scope": "off",
            ...hooksPlugin.configs.recommended.rules,
        },
    },
    {
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                },
            ],
            "@stylistic/spaced-comment": ["error", "always", { markers: ["/"] }],
        },
    },
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // Matches any import statement that are 'react'
                        ["^react$"],

                        // Matches any import statement that starts with '@' followed by any word character
                        ["^@?\\w"],

                        // Matches any import statement that starts with a dot, but not when it is followed by a forward slash (i.e., not a relative import), and not when it is followed by nothing (i.e., not an absolute import). Also matches import statements that start with two dots, followed by either nothing or a forward slash (i.e., a relative parent import).
                        ["^\\.(?!/?$)", "^\\.\\./?$"],

                        // Side effect imports.
                        ["^\\u0000"],
                    ],
                },
            ],
        },
    },
    {
        rules: {
            // Formatting
            "prettier/prettier": [
                "error",
                {
                    printWidth: 120,
                    endOfLine: "auto",
                    overrides: [
                        {
                            files: ["*.yml", "*.yaml"],
                            options: {
                                tabWidth: 2,
                            },
                        },
                    ],
                },
            ],

            // React
            "react/display-name": "off",

            // TypeScript
            "@typescript-eslint/no-unused-vars": "error",
        },
    },
    {
        files: ["tailwind.config.js"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "no-undef": "off",
        },
    },
];
