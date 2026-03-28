# Repository Guidelines

## Project Structure & Module Organization

Core library code lives in `src/`. Main areas are `CalculateTree/` for layout, `CreateTree/` for editing flows, `Cards/` for card rendering, `view/` for SVG/HTML presentation, and `handlers/` for interaction logic. The package entry point is `src/index.js`.

Build output is written to `dist/` and should be treated as generated artifacts. Example integrations and demo pages live in `examples/`. Supporting docs are in `docs/`. Test infrastructure is under `tests/`, which currently contains a Cypress project (`tests/cypress.json`).

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run build`: bundle the library with Rollup and run the custom packaging steps in `scripts/build.js`.
- `npm run dev`: start `http-server` from the repo root for local demo work.
- `npm test`: open the Cypress runner using the `tests/` project.

For local verification, run `npm run build` after source changes and open `examples/index.html` through the dev server to check behavior.

## Coding Style & Naming Conventions

This repo uses ES modules and plain JavaScript. Follow the existing style: semicolons are generally omitted, indentation is 2 spaces, and import paths are explicit, for example `./view/view.js`.

Use `camelCase` for variables and functions, `PascalCase` for constructor-style modules such as `CalculateTree`, and descriptive file names that match the current folder patterns like `view.links.js` or `CardSvg.js`. Keep changes scoped to the relevant module instead of adding cross-cutting helpers in `src/index.js`.

## Testing Guidelines

End-to-end and integration checks are Cypress-based. Add or update specs inside the `tests/` project when behavior changes, and validate affected examples manually in the browser because the repository does not currently define unit-test or coverage gates.

Name new test files by feature or workflow, and keep fixtures near the scenario they support.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit prefixes, especially `feat:`. Continue with `feat:`, `fix:`, `docs:`, `refactor:`, or `chore:` followed by a short imperative summary.

Pull requests should include a concise description, the user-visible impact, linked issues when applicable, and screenshots or GIFs for UI or rendering changes. Call out any `dist/` updates and example changes so reviewers can verify the generated output.
