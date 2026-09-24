import { FireChart } from './presentation/components/FireChart'
import { InputPanel } from './presentation/components/InputPanel'
import { AdvancedSection } from './presentation/components/AdvancedSection'
import { StrikeChart } from './presentation/components/StrikeChart'
import { AboutFire } from './presentation/components/AboutFire'
import { useFirePlan } from './presentation/hooks/useFirePlan'
import { useViewportWidth } from './presentation/hooks/useViewportWidth'
import { describeCrossing } from './presentation/mappers/chartData'
import { fireMultiplier } from './application/dto'

export function App() {
  const { fields, applied, setField, calculate, dirty, errors, canCalculate, fire, strike } =
    useFirePlan()
  const horizon = fire.ages.at(-1) ?? applied.currentAge
  const width = useViewportWidth()
  const height = width < 480 ? 300 : 380
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
        fields={fields}
        fireNumber={fire.fireNumber}
        fireSpending={applied.annualSpending}
        multiplier={fireMultiplier(applied.drawRate)}
        dirty={dirty}
        errors={errors}
        canCalculate={canCalculate}
        onChange={setField}
        onCalculate={calculate}
      />
      <AdvancedSection fields={fields} onChange={setField} />
      <section>
        <h2>Current pace — FIRE projection</h2>
        <p>
          Median FI at age {describeCrossing(fire.crossings.p50, horizon)} (p10:{' '}
          {describeCrossing(fire.crossings.p10, horizon)}, p90:{' '}
          {describeCrossing(fire.crossings.p90, horizon)})
        </p>
        <div className="chart-scroll">
          <FireChart view={fire} width={width} height={height} />
        </div>
      </section>
      <section>
        <h2>STRIKE — accelerated plan</h2>
        <div className="chart-scroll">
          <StrikeChart strike={strike} fire={fire} width={width} height={height} />
        </div>
      </section>
      <AboutFire />
    </main>
  )
}