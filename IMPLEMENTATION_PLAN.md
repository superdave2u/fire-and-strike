# IMPLEMENTATION_PLAN — fire-and-strike

**Loop instructions (read every iteration):**

1. Read `README.md`, `SPEC.md` and this file in full before acting.
2. Execute the **first unchecked** task below, strictly per TDD: write a failing test first, run it, implement the minimum to pass it, refactor. Follow `SPEC.md` §6 process rules and the ubiquitous language.
3. Run `npm run gates` — lint, typecheck and tests must all pass.
4. Commit everything (including the ticked checkbox for this task) with a conventional commit message, e.g. `feat(domain): FireGoal value object (25x spending rule)`.
5. If all tasks are checked: create `.ralph/DONE`, commit, and stop.

Conventions: value objects expose `static of(value)` factories that throw on invalid input; use `import type` for type-only imports; no comments in production code unless the spec demands one; exports in `src/domain` are consumed only through `src/application` from the UI.

---

- [x] **T1 — Money + FireGoal value objects** (`src/domain/model/Money.ts`, `src/domain/model/FireGoal.ts`)
  Done when: `Money.of` accepts 0 and positive finite numbers, rejects NaN/Infinity/negatives; `FireGoal.of(60000).target.value === 1500000` (×25 rule); `FireGoal.of(spending, multiplier)` supports custom multipliers; rejects non-positive spending.
- [x] **T2 — AllocationMix value object** (`src/domain/model/AllocationMix.ts`)
  Done when: weight 0.8 → mean 0.061, std 0.156; 1.0 → 0.07/0.18; 0.0 → 0.025/0.06; rejects weights outside [0,1].
- [x] **T3 — Percentile port + implementation** (`src/domain/ports/PercentileFn.ts`, `src/infrastructure/stats/percentile.ts`)
  Done when: `linearInterpolationPercentile(sorted, 50)` on [1..100] = 50.5, p10 = 10.9, p90 = 90.1; rejects p outside [0,100] and unsorted input is handled (sort inside or document precondition via test).
- [x] **T4 — PercentileAggregator** (`src/domain/services/PercentileAggregator.ts`)
  Done when: given runs (each run = values per age), returns p10/p50/p90 arrays of equal length; uses the injected `PercentileFn`; ordering p10 ≤ p50 ≤ p90 verified on synthetic data.
- [x] **T5 — RandomGenerator/ReturnModel ports + GaussianReturnModel** (`src/domain/ports/RandomGenerator.ts`, `src/domain/ports/ReturnModel.ts`, `src/domain/services/GaussianReturnModel.ts`)
  Done when: fake `RandomGenerator` returning a canned sequence drives `GaussianReturnModel.next()` = `mean + std·z`; a fake returning always 0 yields exactly `mean` every call.
- [x] **T6 — MonteCarloFireProjector** (`src/domain/services/MonteCarloFireProjector.ts`) + **arch-unit boundary test** (`src/domain/boundaries.test.ts` scanning `src/domain/**` for forbidden imports: react, react-dom, recharts, application, infrastructure, presentation)
  Done when: with a std=0 return model (fake RNG z=0) the projection is the exact compound curve `v = v·(1+mean) + c` (golden values, `toBeCloseTo`); ages run startAge..horizon inclusive with `v(startAge) = currentPortfolio`; crossings are the first age each percentile path reaches the goal, `null` when never; with noise, p10 ≤ p50 ≤ p90 at every age; 10,000-run run completes < 1s.
- [x] **T7 — StrikePaceSolver** (`src/domain/services/StrikePaceSolver.ts`)
  Done when: std=0 scenario matches the closed-form solution `(goal − v·(1+g)ⁿ)·g/((1+g)ⁿ−1) − c` to within a whole dollar; returns 0 when the goal is already reached at the target age with current pace; extra contribution is monotonically larger for earlier target ages; final accelerated p50 value at target age ≥ FIRE number; throws `UnreachableStrikeTargetError` when even the bracket cap cannot reach the goal; horizon auto-extended to cover targetAge.
- [x] **T8 — Mulberry32Normal seeded RNG adapter** (`src/infrastructure/rng/Mulberry32Normal.ts`)
  Done when: same seed → identical standard-normal stream (snapshot compare of 1000 draws); different seeds → different streams; 10,000 draws have mean within ±0.05 of 0 and std within ±0.1 of 1; implements `RandomGenerator` (domain port).
- [x] **T9 — ProjectFireTrajectory use case** (`src/application/ProjectFireTrajectory.ts`, `src/application/dto.ts`)
  Done when: maps raw plan inputs through value objects (invalid → throws before any simulation), wires `GaussianReturnModel` factory + `Mulberry32Normal` + `PercentileAggregator`, returns the `FireProjectionView` DTO (ages, p10/p50/p90, fireNumber, crossings) matching FR-3/FR-4 semantics.
- [x] **T10 — SolveStrikePlan use case** (`src/application/SolveStrikePlan.ts`)
  Done when: wraps `StrikePaceSolver`, returns `StrikePlanView` (achievable, extraYearlyContribution, acceleratedP50, ages); unachievable target → `achievable: false` view, not an exception.
- [x] **T11 — Chart data mappers** (`src/presentation/mappers/chartData.ts`)
  Done when: `toFireRows` produces one row per age `{age, p10, p50, p90, fire}`; `toStrikeRows` produces `{age, current, accelerated, fire}`; pure functions, no recharts imports.
- [x] **T12 — InputPanel component** (`src/presentation/components/InputPanel.tsx`)
  Done when: renders all FR-1 inputs with labels; changing a field invokes `onChange`; displays "FIRE number: $1,500,000 (25 × $60,000)" for defaults; slider shows the stock %.
- [x] **T13 — FireChart component** (`src/presentation/components/FireChart.tsx`)
  Done when: renders an svg with p10/p50/p90 legend entries, the FIRE reference line, and median-crossing reference line when a crossing exists; accepts explicit width/height (no ResponsiveContainer) for deterministic tests.
- [x] **T14 — StrikeChart component** (`src/presentation/components/StrikeChart.tsx`)
  Done when: renders current vs accelerated p50 lines + FIRE line + target-age reference line + the "Extra yearly contribution needed" card (or "Already on pace"/"Not achievable" variants).
- [x] **T15 — useFirePlan hook + App wiring** (`src/presentation/hooks/useFirePlan.ts`, `src/App.tsx`, `src/index.css`)
  Done when: hook holds FR-6 defaults, derives both views via the use cases (memoized), clamps invalid input changes; App renders InputPanel + both chart sections and updates the FIRE-number readout and STRIKE card live as inputs change; template boilerplate (App.css, assets) removed.
- [x] **T16 — GitHub Pages deployment** (`.github/workflows/deploy.yml`, `vite.config.ts` base already `/fire-and-strike/`)
  Done when: workflow has build job (npm ci → lint → typecheck → vitest run → build → configure-pages → upload-pages-artifact) and deploy job (needs: build, deploy-pages, environment github-pages, permissions pages:write + id-token:write, concurrency: pages); local `npm run gates` + `npm run build` green; `dist/index.html` references `/fire-and-strike/` assets; README deployment handoff steps verified.