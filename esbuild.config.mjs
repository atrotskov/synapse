import * as esbuild from "esbuild";

const isProduction = process.argv.includes("--production");

esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  platform: "browser",
  mainFields: ["browser", "module", "main"],
  external: ["obsidian"],
  outfile: "dist/main.js",
  format: "cjs",
  sourcemap: !isProduction,
  banner: {
    js: "// @ts-nocheck\n",
  },
  plugins: [],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
