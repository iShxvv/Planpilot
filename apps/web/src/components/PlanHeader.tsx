import styles from "../pages/PlanPage.module.css";
import { EventPlan } from "../api";

type TabKey = "plan" | "attendees" | "emails" | "budget";

interface PlanHeaderProps {
  plan: EventPlan;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNavigateHome: () => void;
}

export default function PlanHeader({
  plan,
  activeTab,
  onTabChange,
  onNavigateHome,
}: PlanHeaderProps) {
  const tabs = [
    { key: "plan" as const, label: "Plan", icon: "note_alt" },
    { key: "attendees" as const, label: "Attendees", icon: "person" },
    { key: "emails" as const, label: "Emails", icon: "mail" },
    { key: "budget" as const, label: "Budget", icon: "payments" },
  ];

  return (
    <header className={styles.topBar}>
      <div className={styles.topLeft}>
        <div className={styles.topPill}>
          <div className={styles.dropdown}>
            <span className={styles.dropdownText}>
              {plan.eventMetadata?.title || plan.eventMetadata?.type || "New Event"}
            </span>
          </div>
          <div className={styles.sliderGroup}>
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`${styles.sliderItem} ${
                  t.key === activeTab
                    ? styles.sliderItemActive
                    : styles.sliderItemInactive
                }`}
                onClick={() => onTabChange(t.key)}
              >
                <span className={styles.sliderIcon}>
                  <span className="material-symbols-rounded">{t.icon}</span>
                </span>
                <span className={styles.sliderLabel}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.topRight}>
        <div className={styles.brand}>planpilot</div>
        <button className={styles.avatar} onClick={onNavigateHome}>
          <span className="material-symbols-rounded">home</span>
        </button>
      </div>
    </header>
  );
}
