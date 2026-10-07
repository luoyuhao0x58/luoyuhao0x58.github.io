// 独立仓库自包含的 ESLint 配置(原 @nettix/config 共享配置内联版)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default tseslint.config(
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", ".turbo/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-side scripts (build plugins + scripts/*): declare Node runtime globals
    // so no-undef stops flagging URL / process / console.
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    // extract-mermaid-palette.mjs evaluates this code inside a headless-browser
    // page (document / getComputedStyle run in the page context, not in Node).
    files: ["scripts/extract-mermaid-palette.mjs"],
    languageOptions: {
      globals: {
        document: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
  {
    // Client-side scripts (src/scripts/*.js, loaded via <script src>): browser globals.
    // post-toc.js/table-hover.js self-declare document/window/Element via inline
    // `/* global ... */` comments, so only the uncovered globals are listed here
    // (duplicating them would trip no-redeclare).
    files: ["src/scripts/**/*.js"],
    languageOptions: {
      globals: {
        requestAnimationFrame: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
  {
    // time-localize.js uses document but has no inline global comment.
    files: ["src/scripts/time-localize.js"],
    languageOptions: {
      globals: {
        document: "readonly",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  ...astro.configs["flat/recommended"],
);
