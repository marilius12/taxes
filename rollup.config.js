import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-import-css";

export default {
  input: "src/browser.tsx",
  output: {
    dir: "dist",
    format: "iife",
    assetFileNames: "style.[hash].[ext]",
    entryFileNames: "calculator.[hash].js",
  },
  plugins: [nodeResolve(), typescript(), terser(), css({ minify: true })],
};
