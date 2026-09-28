import { DashboardHeading, DashboardIcon, DashboardShell } from "../dashboard-shell";
import { investmentPlans } from "../../plan-content";

export default function InvestmentPlansPage() {
  return (
    <DashboardShell active="plans">
      <DashboardHeading
        eyebrow="Choose your path"
        title="Investment Plans"
        description="Compare the available tiers and find the level that fits your goals."
      />
      <section aria-label="Available investment plans" className="investment-plan-grid">
        {investmentPlans.map((plan, index) => (
          <article
            className={`investment-plan-card ${index === 1 ? "is-featured" : ""}`}
            key={plan.name}
          >
            <div className="investment-plan-topline">
              <span className="investment-plan-icon"><DashboardIcon name="plans" /></span>
              {index === 1 && <span className="investment-plan-badge">Popular</span>}
            </div>
            <p className="investment-plan-eyebrow">Investment tier</p>
            <h2>{plan.name}</h2>
            <p className="investment-plan-description">{plan.description}</p>
            <div className="investment-plan-range">
              <span>Investment range</span>
              <strong>{plan.minimum}<i>to</i>{plan.maximum}</strong>
            </div>
            <ul>
              <li>Fast token conversion</li>
              <li>Secure wallet access</li>
              <li>{plan.benefit}</li>
            </ul>
            <p className="investment-plan-note">Plan details coming soon</p>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}