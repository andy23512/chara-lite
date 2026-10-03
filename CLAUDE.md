# CLAUDE.md

## What this is

Chara Lite is an unofficial chord practice tool for CharaChorder Lite. It is the CharaChorder Lite counterpart of [Chara](https://andy23512.github.io/chara/) (chord library management + spaced-practice phases — Adapt, Realize, Accumulate, the "CHARA cycle" — for CharaChorder 3D input devices), in the same companion relationship as Alnilam is to Alnitak.

Deployed as a static site to GitHub Pages at https://andy23512.github.io/chara-lite/.

**Status: mid-migration.** This repo started as a wholesale copy of Chara with the project identifiers renamed (`package.json`, `project.json`, README). Migration is proceeding piece by piece. Already Lite-shaped: `home-page` and `chord-practice-view` now render the keyboard via `cclite-layout`/`cclite-layout-key` (modeled after Alnilam, driven by a plain `highlightPositionCodes: number[]` input), the old 3D-device `layout`/`switch`/`switch-sector` components have been removed, `information-page` and the i18n copy describe CharaChorder Lite rather than the 3D devices, and the `visibility-setting` model no longer has the 3D-only `layoutThumb3Switch` entry. Still untouched: `DeviceLayoutStore`'s `ProfileLayoutMap` data model and the serial I/O layer (`src/app/services/serial-handler.service.ts`, `serial-port-handler.service.ts`) still speak the CharaChorder 3D device protocol inherited from Chara, not yet switched to CharaChorder Lite / `tangent-cc-lib`. Don't assume anything under `src/` is already Lite-specific just because this file's surrounding config says "chara-lite" — check each piece individually. When migrating a piece, Alnilam (the Lite counterpart of Alnitak) is the reference for what the Lite-shaped equivalent should look like.

## Tech stack

- Angular 21 (standalone, signals-based) + NgRx (`@ngrx/signals`, `@ngrx/store`, `@ngrx/component`)
- Nx 22 as the build/task runner (single-project workspace, executor is `@angular-devkit/build-angular`)
- TypeScript 5.9, SCSS, Tailwind CSS, Angular Material, AG Grid, Highcharts
- `@ngx-translate` for i18n (locale files under `src/assets/i18n/`: en, zh-TW, jp)
- Package manager: Yarn (Berry, `node-modules` linker — see `.yarnrc.yml`)
- Web Serial API used directly (`src/app/services/serial-handler.service.ts`, `serial-port-handler.service.ts`) — **still talks the CharaChorder 3D device protocol, inherited from Chara, not yet switched to CharaChorder Lite / `tangent-cc-lib`.**

## Commands

- Install: `yarn`
- Dev server: `yarn start` (runs `nx serve --port 8315`)
- Build: `yarn build` (`nx build`, production config by default)
- Watch build: `yarn watch` (`nx build --watch --configuration development`)
- Test: `yarn test` (`nx test`, Karma + Jasmine)
- Deploy (CI only): `yarn nx deploy` — publishes `dist/chara-lite` to GitHub Pages via `angular-cli-ghpages`
- `yarn minify-icon-font` — regenerates the subset icon font from `src/tools/minify-icon-font.ts`; CI runs this before every deploy

There is no separate lint script in `package.json`.

## Architecture notes

- No `angular.json` — project/build config lives in `project.json` (Nx project) and `nx.json` (workspace defaults).
- `src/app/` layout: `pages/` (route-level: chords-page, adaptation-page, realization-page, accumulation-page, custom-practice-page, settings-page, home-page, information-page), `components/`, `services/`, `stores/` (NgRx signal stores), `models/`, `pipes/`, `directives/`, `guards/`, `utils/`, `mock/`. This page structure is the part worth keeping — it's the CHARA cycle, not 3D-device-specific.
- Web worker support is wired up (`tsconfig.worker.json`, `worker/worker.d.ts`) but no `*.worker.ts` files exist yet — it's scaffolding, not in active use.
- `@mlc-ai/web-runtime` / `web-tokenizers` / `web-xgrammar` are dependencies but not currently referenced anywhere in `src/` — likely for a planned/experimental feature, not wired into the app yet.
- `dexie` is a dependency but not currently used in `src/app` — check before assuming IndexedDB persistence is active.
- `migrations.json` is Nx's auto-generated migration log, not app logic — don't hand-edit.
- `tangent-cc-lib` in `package.json` has already been bumped to Alnilam's version (`0.0.56`, up from Chara's `0.0.51`) to pick up the `HighlightKeyCombination` API the Lite layout components need — device I/O itself hasn't been migrated yet, though.

## Gotchas

- CI (`.github/workflows/main.yml`) deploys on every push to `main` with no test/lint gate — `yarn nx deploy` runs directly after `yarn minify-icon-font`.
- The dev server's default port is 8315 (not Angular's usual 4200), but `.vscode/launch.json` still points at `http://localhost:4200/` — stale if you use the VS Code debug configs.
- `deploy` target sets a `baseHref` of `/chara-lite/`, so local dev and GitHub Pages serve from different base paths.
- Keep this "Status" note up to date as pieces get migrated from 3D-device to Lite — strike through/remove claims here once the corresponding code actually changes, instead of leaving this file describing Chara forever.
