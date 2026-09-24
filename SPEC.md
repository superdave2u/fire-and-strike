# SPEC — fire-and-strike

**This is the spec of record.** Every task in `IMPLEMENTATION_PLAN.md` must conform to this document. Agents (human or loop-driven) must read this file in full before changing code. Changes to this file are part of the spec-approval process, never incidental edits.

---

## 1. Purpose

A retirement calculator for the FIRE community with exactly two use cases:

- **UC-1 FIRE projection (current pace):** given inputs, project when the FIRE goal is reached. Output: a fan chart of portfolio value vs age with p10 / p50 / p90 paths, the FIRE-number line, and the age at which each percentile path reaches the goal.
- **UC-2 STRIKE plan (accelerated pace):** given a target retirement age, compute the smallest extra yearly contribution such that the **median (p50)** path reaches the FIRE number at that age ("50% chance" confidence). Output: the extra $/yr and the accelerated p50 path charted against the current-pace p50 path.

## 2. Ubiquitous language (DDD)

Used consistently in code, tests, docs and UI. Do not invent synonyms.

| Term           | Definition |
|----------------|------------|
| **FIRE number**| Target portfolio value = annual spending × 25 (the 4% rule). |
| **FireGoal**   | Value object pairing annual spending with the ×25 multiplier; exposes `target` (the FIRE number). |
| **Money**      | A non-negative finite dollar amount. |
| **AllocationMix** | Value object holding the stock weight (0–1); the complement is bonds. Derives blended real-return parameters. |
| **Pace**       | Yearly contribution, flat in real terms (inflation-adjusted dollars), added at the end of each simulated year. |
| **Trajectory** | Portfolio value path across ages. |
| **Crossing age** | First age at which a percentile path reaches the FIRE number; `null` if never reached within the horizon. |
| **STRIKE**     | The accelerated plan: extra yearly contribution targeting a declared retirement age at p50 confidence. |
| **StrikePlan** | Result of the solver: extra yearly contribution + accelerated p50 trajectory. |

## 3. Architecture — Onion / Clean

Dependencies point **inward only**:

```
presentation  →  application  →  domain  ←  infrastructure (adapters)
```

| Layer | Contains | May import |
|-------|----------|------------|
| `src/domain` | Value objects (`Money`, `FireGoal`, `AllocationMix`, `Pace`, `StrikePlan`), domain services (`GaussianReturnModel`, `MonteCarloFireProjector`, `StrikePaceSolver`, `PercentileAggregator`), ports (`RandomGenerator`, `ReturnModel`, `PercentileFn`) | only `src/domain`, `vitest` in tests |
| `src/application` | Use cases (`ProjectFireTrajectory`, `SolveStrikePlan`) + view DTOs | `src/domain` |
| `src/infrastructure` | Seeded RNG adapter (`Mulberry32Normal`), statistics (`percentile.ts`) | `src/domain` |
| `src/presentation` | React components, hooks, pure chart-data mappers | `src/application`, `src/infrastructure` (composition), react, recharts |

**Layer-boundary enforcement:** an arch-unit test scans each layer's source files for forbidden import specifiers and fails the suite on violation (oxlint cannot express per-directory import rules).

### SOLID conventions

- **SRP** — projector simulates, aggregator reduces percentiles, solver searches; one reason to change each.
- **OCP/LSP** — new return models (e.g. historical bootstrap) implement the `ReturnModel` port; nothing else changes.
- **ISP** — narrow ports: `RandomGenerator` exposes only `standardNormal()`.
- **DIP** — domain services depend on ports; tests inject fake/deterministic implementations. No domain test depends on infrastructure.

## 4. Functional requirements

- **FR-1 Inputs** (presentation, validated by value objects): current age, current portfolio value ($), yearly contribution ($/yr), expected retirement spending ($/yr), stock allocation slider (0–100%), target retirement age.
- **FR-2 FIRE number** = annual spending × 25, shown live in the UI.
- **FR-3 Projection semantics (Monte Carlo):**
  - Real (inflation-adjusted) annual returns. 100% stocks: mean 7%, σ 18%. Bonds: mean 2.5%, σ 6%. Allocation mix blends **linearly**: `mean = w·7 + (1−w)·2.5`, `std = w·18 + (1−w)·6` (all in decimal).
  - Annual steps: `v(age+1) = v(age) × (1 + r) + contribution` (contribution at end of year). `v(startAge) = currentPortfolio`.
  - 10,000 runs; returns drawn i.i.d. Gaussian via a standard-normal random source; no clipping (probability of r < −100% is negligible at these parameters).
  - Horizon: `max(75, startAge + 1)`, inclusive.
- **FR-4 Percentile fan chart:** per-age p10 / p50 / p90 (linear interpolation across runs, cross-sectionally per age); horizontal FIRE-number line; vertical marker at the median (p50) crossing age; summary line "Median FI at age X (p10: Y, p90: Z)" — a percentile that never crosses renders as "not by age H".
- **FR-5 STRIKE solver:** binary search (whole dollars) for the smallest extra contribution c ≥ 0 such that the **p50** value at target age ≥ FIRE number. Deterministic seed ⇒ identical results for identical inputs. Solver evaluations replay the same seed with 3,000 runs (median estimate precision); FR-3's 10,000 runs apply to the FIRE projection. If already reached with current pace → 0. If unreachable even at the bracket cap → `achievable: false`.
- **FR-6 Defaults:** age 35, portfolio $100,000, contribution $30,000/yr, spending $60,000/yr (FIRE number $1,500,000), stocks 80%, target age 55.
- **FR-7 Charts (Recharts):** FIRE chart = p10/p50/p90 lines + FIRE reference line + median-crossing marker; STRIKE chart = current-pace p50 vs accelerated p50 + FIRE line + target-age line + card "Extra yearly contribution needed: $X".
- **FR-8 Determinism:** simulation and solver use a fixed seed (42) derived at composition; the same inputs always produce identical outputs.

## 5. Non-functional requirements

- **NF-1 Pure domain:** no framework imports in `src/domain`; randomness injected via ports so tests are exact, not statistical.
- **NF-2 Performance:** a full projection + strike solve completes in well under a second on a development laptop.
- **NF-3 Testability:** colocated `*.test.ts` next to each unit; fake RNGs and spy percentiles in domain tests; Testing Library for components.

## 6. Process requirements (TDD + gates)

- **TDD:** no production code without a failing test written first (red → green → refactor). Tests colocated: `foo.ts` ↔ `foo.test.ts`.
- **Gates before every commit:** `npm run gates` (oxlint, `tsc --noEmit`, `vitest run`) must pass. A red suite never commits.
- **Commits:** conventional commits — `feat(domain): …`, `test(presentation): …`, `chore(ci): …`. One task per commit; the IMPLEMENTATION_PLAN checkbox for a task is ticked in the same commit.
- **Architecture rule:** the arch-unit boundary test must stay green; violations are build breakage, not style.

## 7. Deployment requirement

- Hosted on **GitHub Pages** via `.github/workflows/deploy.yml` on push to `main` (+ `workflow_dispatch`).
- Build job = full CI gate; deploy job (needs build) uses `actions/configure-pages` → `upload-pages-artifact` (`dist/`) → `deploy-pages`, with `permissions: pages: write, id-token: write`, `environment: github-pages`, and `concurrency: pages`.
- Vite `base: '/fire-and-strike/'` matches the project-page subpath.

## 8. Acceptance criteria

- [ ] AC-1: spending $60,000 → FIRE number $1,500,000 displayed.
- [ ] AC-2: with defaults, the FIRE chart renders three percentile lines, the FIRE line, and a median-FI summary; p10 ≤ p50 ≤ p90 at every age.
- [ ] AC-3: crossing age is a number ≥ current age or "not by age H" — never a crash.
- [ ] AC-4: with defaults, STRIKE reports a positive extra $/yr and the accelerated p50 path reaches the FIRE number exactly at the target age.
- [ ] AC-5: identical inputs → identical outputs across reloads (seeded determinism).
- [ ] AC-6: `npm run gates` green; `npm run build` emits `dist/` with `/fire-and-strike/` asset paths.