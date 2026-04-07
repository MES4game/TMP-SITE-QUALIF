import path from 'path';
import { defineConfig } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr';
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
    staged: {
        "*": "vp check --fix",
    },
    fmt: {
        arrowParens: "always",
        bracketSameLine: true,
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        endOfLine: "lf",
        htmlWhitespaceSensitivity: "css",
        ignorePatterns: ["**/dist/**", "**/build/**"],
        insertFinalNewline: true,
        jsdoc: {
            addDefaultToDescription: true,
            bracketSpacing: false,
            capitalizeDescriptions: true,
            commentLineStrategy: "multiline",
            descriptionTag: true,
            descriptionWithDot: true,
            keepUnparsableExampleIndent: false,
            lineWrappingStyle: "greedy",
            preferCodeFences: true,
            separateReturnsFromParam: true,
            separateTagGroups: true,
        },
        jsxSingleQuote: true,
        objectWrap: "collapse",
        overrides: [],
        printWidth: 120,
        proseWrap: "preserve",
        quoteProps: "consistent",
        semi: true,
        singleAttributePerLine: false,
        singleQuote: true,
        sortImports: {
            customGroups: [],
            groups: [
                "builtin",
                "external",
                ["internal", "subpath"],
                ["parent", "sibling", "index"],
                "style",
                "unknown",
            ],
            ignoreCase: true,
            internalPattern: ["./", "../"],
            newlinesBetween: true,
            order: "asc",
            partitionByComment: false,
            partitionByNewline: false,
            sortSideEffects: false,
        },
        sortPackageJson: true,
        tabWidth: 4,
        trailingComma: "all",
        useTabs: true,
        vueIndentScriptAndStyle: true,
    },
    lint: { options: { typeAware: true, typeCheck: true } },
    plugins: [react(), svgr(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
});
