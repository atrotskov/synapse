import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const isProduction = process.argv.includes("--production");

// Read the Angular bundle and convert to a module
const angularBundlePath = path.resolve("dist/angular-ui.js");
let angularBundle = "";
if (fs.existsSync(angularBundlePath)) {
  angularBundle = fs.readFileSync(angularBundlePath, "utf-8");
}

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
  plugins: [
    {
      name: "angular-bundle",
      setup(build) {
        build.onResolve({ filter: /^angular-ui-bundle$/ }, () => ({
          path: "angular-ui-bundle",
          namespace: "angular-bundle",
        }));
        build.onLoad({ filter: /^angular-ui-bundle$/, namespace: "angular-bundle" }, () => ({
          contents: `export const angularBundle = ${JSON.stringify(angularBundle)};`,
          loader: "js",
        }));
      },
    },
  ],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});