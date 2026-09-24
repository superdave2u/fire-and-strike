import { FireChart } from './presentation/components/FireChart'
import { InputPanel } from './presentation/components/InputPanel'
import { StrikeChart } from './presentation/components/StrikeChart'
import { useFirePlan } from './presentation/hooks/useFirePlan'
import { describeCrossing } from './presentation/mappers/chartData'
import { fireMultiplier } from './application/dto'

export function App() {
  const { inputs, applied, setField, calculate, dirty, fire, strike } = useFirePlan()
  const horizon = fire.ages.at(-1) ?? inputs.currentAge
  return (
    <main>
      <header>
        <h1>Fire &amp; Strike</h1>
        <p>
          Find your FIRE date at your current pace — then the extra yearly contribution
          (the STRIKE) to retire at the age you declare.
        </p>
      </header>
      <InputPanel
        inputs={inputs}
        fireNumber={fire.fireNumber}
        fireSpending={applied.annualSpending}
        multiplier={fireMultiplier(applied.drawRate)}
        dirty={dirty}
        onChange={setField}
        onCalculate={calculate}
      />
      <section>
        <h2>Current pace — FIRE projection</h2>
        <p>
          Median FI at age {describeCrossing(fire.crossings.p50, horizon)} (p10:{' '}
          {describeCrossing(fire.crossings.p10, horizon)}, p90:{' '}
          {describeCrossing(fire.crossings.p90, horizon)})
        </p>
        <FireChart view={fire} />
      </section>
      <section>
        <h2>STRIKE — accelerated plan</h2>
        <StrikeChart strike={strike} fire={fire} />
      </section>
    </main>
  )
}