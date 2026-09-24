export function AboutFire() {
  return (
    <section className="about">
      <h2>New to FIRE?</h2>
      <p>
        FIRE stands for <strong>Financial Independence, Retire Early</strong>. Here, retirement is a{' '}
        <strong>financial milestone — not an age</strong> and not an age gate. You reach it when your
        investments can cover your yearly spending on their own, so working becomes optional rather
        than required.
      </p>
      <p>
        That milestone can land at 30, 45, or 65 — what matters is the size of your portfolio
        relative to your spending, not a birthday. Some people cross it and keep working by choice;
        others use it to change careers, go part-time, or take a break. The right number is the one
        that fits your life, so treat the ages on these charts as outcomes to plan around, not rules
        to obey.
      </p>
      <ul>
        <li>
          <strong>FIRE number</strong> — the portfolio that covers your spending. At the classic 4%
          draw rate that's about 25× your yearly spending.
        </li>
        <li>
          <strong>Draw rate</strong> — the share of the portfolio you withdraw each year. 4% is the
          well-known rule of thumb, not a guarantee.
        </li>
        <li>
          <strong>p10 / p50 / p90</strong> — the spread of outcomes across thousands of simulated
          market paths. p50 is the median; p10 is an unlucky market, p90 a lucky one.
        </li>
        <li>
          <strong>STRIKE</strong> — the extra amount to invest each year to reach the milestone by
          the age you declare, with a 50% chance.
        </li>
      </ul>
      <p className="about-disclaimer">
        This tool is for education and planning, not financial advice.
      </p>
    </section>
  )
}