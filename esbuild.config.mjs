import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const isProduction = process.argv.includes("--production");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const angularAppPath = path.resolve(__dirname, './src/angular/dist/synapse-angular/browser/main.js');

const angularPlugin = {
  name: "angular-app-resolver",
  setup(build) {
    build.onResolve({ filter: /^angular-app$/ }, args => ({
      path: angularAppPath
    }));
  }
};

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
  plugins: [angularPlugin]
}).catch((e) => {
  console.error(e);
  process.exit(1);
});