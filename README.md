# KleenestApp

## Application path

The active application entry point is `index.html` at the repository root.

Supporting application modules live alongside it as `kleenest-*.js` files.

## Branches

- `main` — production/default application branch.
- `refactor/monolith-removal` — active cleanup/refactor branch.
- `backup/*` — retained rollback checkpoints only.

Temporary extraction artifacts, generated pass files, and incomplete module stubs do not belong in the application tree.

## Cleanup rule

Keep the repository focused on the runnable app, required supporting modules, documentation that describes the current architecture, and intentionally retained backup checkpoints. Remove temporary artifacts after a refactor is safely incorporated.