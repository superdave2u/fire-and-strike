# Fire & Strike

A retirement calculator for the FIRE (Financial Independence, Retire Early) community with two use cases:

1. **FIRE projection (current pace)** — enter your expected retirement spending, current age, current portfolio value and yearly contribution. The app runs a Monte Carlo simulation over real (inflation-adjusted) returns and charts the **p10 / p50 / p90** paths of your portfolio vs age, with the moment each percentile reaches your FIRE number (spending × 25, the 4% rule).
2. **STRIKE plan (accelerated pace)** — declare a target retirement age. The app solves for the **extra yearly contribution** required so that the **median (p50)** path reaches FIRE exactly at that age, and charts the accelerated path against your current pace.

Every edit is a **draft** — nothing is simulated until you press **Calculate**, which keeps typing responsive. Values aren't clamped while you type: clear or retype freely. If a field is blank or out of range, a warning appears above Calculate and the button stays locked until it's fixed. A collapsed **Advanced assumptions** section exposes the draw rate, expected real returns and volatilities (defaults: 4% draw rate, 7%/2.5% returns, 18%/6% volatility), and the charts adapt to mobile widths.

New to the movement? The page footer explains FIRE for newcomers — and why **retirement is a financial milestone, not an age gate**.

## Quickstart

```bash
npm install
npm run dev        # dev server under /fire-and-strike/ (matches Pages base path)
npm test           # vitest (one shot)
npm run test:watch # vitest watch
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
npm run gates      # lint + typecheck + tests — must pass before every commit
npm run build      # tsc -b && vite build (outputs dist/)
```

## Architecture

Onion / Clean layering, dependencies point inward. See **[SPEC.md](SPEC.md)** — the spec of record — for the ubiquitous language, layer rules, SOLID conventions, functional requirements and acceptance criteria. See **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** for the ordered task list.

```
src/domain           pure TypeScript: value objects, services, ports (no framework imports)
src/application      use cases orchestrating the domain (ProjectFireTrajectory, SolveStrikePlan)
src/infrastructure   adapters implementing domain ports (seeded RNG, percentile math)
src/presentation     React components, hooks, pure chart-data mappers
```

The domain layer is guarded by an arch-unit test (`src/domain/boundaries.test.ts`): if any domain file imports react/recharts/application/infrastructure/presentation, the suite fails.

## Ralph Wiggum iteration loop

This repository is designed to be built by a "dumb loop" harness: an agent given the same fixed instructions every iteration, making progress task-by-task, with the test suite as the only error correction.

- `SPEC.md` — what to build and the practices to follow (DDD, TDD, Onion/Clean, SOLID).
- `IMPLEMENTATION_PLAN.md` — ordered, checkboxed tasks; each is one TDD cycle with explicit done-when gates.
- `scripts/ralph.sh` — the loop:

```bash
./scripts/ralph.sh          # up to 25 iterations
./scripts/ralph.sh 10       # custom cap
touch .ralph/STOP           # graceful stop between iterations
```

Each iteration instructs the agent (default `opencode run`, override with `RALPH_AGENT="..."`) to: read the docs, execute the **first unchecked task** per strict TDD, run the gates, commit with a conventional message, tick the checkbox. The loop halts on: cap reached, `.ralph/STOP`, `.ralph/DONE` (all tasks checked), or an iteration that produces no commit (fail-safe).

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main` (and manual `workflow_dispatch`). The build job runs the full CI gate (lint, typecheck, tests) before the deploy job publishes `dist/` via the official GitHub Pages actions.

One-time handoff:

1. Create the GitHub repo and push `main`:
   ```bash
   gh repo create fire-and-strike --public --source=. --push
   ```
2. Enable Pages with the Actions source (one-time):
   ```bash
   gh api -X POST repos/<owner>/fire-and-strike/pages -f build_type=workflow
   ```
   (or Settings → Pages → Build and deployment → Source: "GitHub Actions")
3. Re-run the workflow (`workflow_dispatch`) or push once more; the site lands at
   `https://<owner>.github.io/fire-and-strike/`.

If the repo slug differs from `fire-and-strike`, change `base` in `vite.config.ts` to `'/<repo-slug>/'` so assets resolve on the project page.