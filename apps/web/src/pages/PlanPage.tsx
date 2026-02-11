// PlanPage.tsx
import React from "react";
import styles from "./PlanPage.module.css";

type ScheduleCard = {
  title: string;
  tone: "brown" | "maroon";
  size: "sm" | "md" | "lg";
};

const scheduleCards: ScheduleCard[] = [
  { title: "Venue", tone: "brown", size: "md" },
  { title: "Speaker", tone: "brown", size: "lg" },
  { title: "Catering", tone: "maroon", size: "sm" },
  { title: "", tone: "brown", size: "md" },
];

// Updated: start from 12pm down to 12am
const times = ["12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12am"];

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={styles.iconBtn} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function MiniIcon({ kind }: { kind: "edit" | "warn" | "coin" | "mail" | "user" }) {
  switch (kind) {
    case "edit":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25z" />
          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      );
    case "warn":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <path d="M1 21h22L12 2 1 21z" />
          <path d="M12 16v-5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="18.5" r="1" />
        </svg>
      );
    case "coin":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path
            d="M14.5 8.5c0-1-1.1-1.8-2.5-1.8S9.5 7.5 9.5 8.5s1.1 1.8 2.5 1.8 2.5.8 2.5 1.8-1.1 1.8-2.5 1.8-2.5-.8-2.5-1.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 20c1.8-4 13.2-4 16 0" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function PlanPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.topPill}>
            <div className={styles.dropdown} role="button" tabIndex={0} aria-label="Select event type">
              <span className={styles.dropdownText}>Wedding</span>
            </div>

            <div className={styles.tabActive} aria-label="Plan tab">
              <span className={styles.tabIcon}>
                <MiniIcon kind="edit" />
              </span>
              <span className={styles.tabText}>Plan</span>
            </div>

            <div className={styles.iconRow} aria-label="Top actions">
              <IconButton label="Alerts">
                <MiniIcon kind="warn" />
              </IconButton>
              <IconButton label="Billing">
                <MiniIcon kind="coin" />
              </IconButton>
              <IconButton label="Messages">
                <MiniIcon kind="mail" />
              </IconButton>
              <IconButton label="Account">
                <MiniIcon kind="user" />
              </IconButton>
            </div>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.brand}>planpilot</div>
          <div className={styles.avatar} aria-label="User avatar" />
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Assistant</div>

          <div className={styles.panelBody}>
            <p className={styles.bold}>I’ve created a rough event plan for you.</p>

            <p className={styles.muted}>
              Please check out the details on the second column, and make any adjustments as necessary.
            </p>

            <p className={styles.muted}>
              Feel free to ask me to help with anything else in this chat panel.
            </p>
          </div>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.actionPill}>
              Change Plans
            </button>
            <button type="button" className={styles.actionPill}>
              Add Event
            </button>
            <button type="button" className={styles.actionPill}>
              A…
            </button>
          </div>

          <div className={styles.chatRow}>
            <input className={styles.chatInput} placeholder="Ask Anything..." aria-label="Ask anything" />
            <button className={styles.chatSend} type="button" aria-label="Send message" />
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.scheduleHeaderRow}>
            <div className={styles.scheduleTitle}>Schedule</div>
            <div className={styles.scheduleDate}>Fri 13/02/2026</div>
          </div>

          {/* Updated: scroll container for a sleek schedule column */}
          <div className={styles.scheduleScroll} aria-label="Schedule scroll area">
            <div className={styles.scheduleGrid}>
              <div className={styles.timeCol} aria-hidden="true">
                {times.map((t) => (
                  <div key={t} className={styles.timeTick}>
                    {t}
                  </div>
                ))}
              </div>

              <div className={styles.blocksCol} aria-label="Schedule items">
                {scheduleCards.map((card, idx) => (
                  <div
                    key={`${card.title || "empty"}-${idx}`}
                    className={[
                      styles.block,
                      card.tone === "maroon" ? styles.blockMaroon : styles.blockBrown,
                      card.size === "lg" ? styles.blockLg : card.size === "sm" ? styles.blockSm : styles.blockMd,
                      card.title ? "" : styles.blockEmpty,
                    ].join(" ")}
                  >
                    <div className={styles.blockTitle}>{card.title}</div>
                    <div className={styles.blockDot} aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={[styles.panel, styles.mainPanel].join(" ")}>
          <div className={styles.mainContent}>
            <h1 className={styles.mainHeading}>Just like that, you have a plan!</h1>
            <p className={styles.mainSub}>Check the columns to the left to dig deeper, modify and refine.</p>
          </div>
        </section>
      </main>
    </div>
  );
}