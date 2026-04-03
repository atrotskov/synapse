# Synapse

**A vocabulary learning plugin for Obsidian with spaced repetition flashcards.**

---

## ⚠️ Why Angular? (Spoiler: just for fun 😄)

This plugin is 100% functional — but using Angular 21 was pure indulgence. I just like Angular, and building an Obsidian plugin felt like a fun challenge. Yes, it adds ~580KB to the bundle. Yes, a vanilla TypeScript implementation would be smaller, faster, and simpler. But where's the fun in that?

If Angular isn't your thing — no hard feelings. The entire Angular app is self-contained in its own bundle and can be swapped out for React, Vue, or plain JS. The modal and plugin infrastructure stays the same.

---

## The Problem

Obsidian doesn't serve plugin files via standard `<script src>` URLs. Paths like `app://obsidian.md/plugins/synapse/angular-ui.js` return `ERR_FILE_NOT_FOUND`.

On top of that, Angular's AOT-compiled libraries (`@angular/common`, `@angular/compiler`, etc.) require a JIT linker at runtime. Loading them as separate files fails with:

```
The injectable '_PlatformLocation' needs to be compiled using the JIT compiler,
but '@angular/compiler' is not available.
```

## The Solution

**Embed the Angular bundle directly into `main.js`** as a string constant, then inject it via a `<script>` tag at runtime.

---

## Architecture

```
src/
  angular/                         # Angular 21 app (zoneless)
    src/
      app/
        app.ts                     # Root component
        app.config.ts              # provideZonelessChangeDetection()
        components/flashcard/      # Flashcard component (OnPush)
      main.ts                      # Auto-bootstrap IIFE
      index.html                   # Minimal HTML shell
    angular.json
  main.ts               # Obsidian plugin entry point
  views/
    angular-modal.ts    # Modal that injects Angular bundle
  types.d.ts           # Type declaration for 'angular-ui-bundle'
esbuild.config.mjs    # esbuild with custom plugin
dist/
  main.js              # Final plugin (~595KB)
  angular-ui.js        # Angular bundle (IIFE, ~572KB)
```

---

## Build Pipeline

`npm run build` executes three steps:

```
1. ng build
   └─ Angular CLI → src/angular/dist/synapse-angular/browser/main.js
                   (fully AOT-compiled, includes JIT fallback)

2. esbuild
   └─ Bundles main.js into dist/angular-ui.js (IIFE, minified)

3. esbuild (with custom plugin)
   └─ Reads angular-ui.js, embeds as string constant
   └─ Bundles plugin → dist/main.js
```

The `angular-bundle` esbuild plugin in `esbuild.config.mjs` handles step 3:

```js
build.onLoad({ filter: /^angular-ui-bundle$/ }, () => ({
  contents: `export const angularBundle = ${JSON.stringify(angularBundle)};`,
  loader: "js",
}));
```

---

## How It Works

1. **Modal opens** → creates `<app-root>` element inside `contentEl`
2. **Modal injects** the bundled Angular script as a `<script>` tag into `document.head`
3. **Angular IIFE auto-bootstraps** — finds existing `<app-root>`, calls `createApplication()`
4. **Modal closes** → `<app-root>` is removed from DOM

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Full pipeline: Angular → esbuild bundle → esbuild plugin → copy assets |
| `npm run build:angular` | Angular CLI production build only |
| `npm run build:angular:bundle` | Bundle Angular output into IIFE |
| `npm run dev` | Watch mode (plugin only, no Angular rebuild) |

---

## Installation

1. Copy all files from `dist/` to `~/.obsidian/plugins/synapse/`
2. Reload Obsidian
3. Enable **Synapse** in the Community Plugins list
4. Run **Open Angular Flashcards** from the command palette (`Ctrl/Cmd + P`)

---

## Future

Since Angular is fully isolated in its own bundle, swapping it out for another framework is straightforward — only the Angular build step and `angular-modal.ts` would need changes. The rest of the plugin is framework-agnostic.

---

*Questions or suggestions? Open an issue or PR.*
