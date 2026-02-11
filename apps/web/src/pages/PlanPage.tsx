// PlanPage.tsx
import React, { useMemo, useState } from "react";
import styles from "./PlanPage.module.css";
import PlanPageBg from "../assets/images/theme_Background.png";

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

const times = ["12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12am"];

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

type TopTabKey = "plan" | "attendees" | "emails";

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState<TopTabKey>("plan");
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendees, setAttendees] = useState<Array<{ name: string; email: string }>>([]);
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [emailType, setEmailType] = useState<"invites" | "status" | "">("");

  // Load attendees from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("planpilot_attendees");
    if (stored) {
      setAttendees(JSON.parse(stored));
    }
  }, []);

  // Close email draft when attendees become 0
  React.useEffect(() => {
    if (attendees.length === 0 && showEmailDraft) {
      setShowEmailDraft(false);
    }
  }, [attendees.length, showEmailDraft]);

  const addAttendee = () => {
    if (!attendeeName.trim() || !attendeeEmail.trim()) return;
    
    const newAttendee = { name: attendeeName, email: attendeeEmail };
    const updatedAttendees = [...attendees, newAttendee];
    
    setAttendees(updatedAttendees);
    localStorage.setItem("planpilot_attendees", JSON.stringify(updatedAttendees));
    
    setShowAddModal(false);
    setAttendeeName("");
    setAttendeeEmail("");
  };

  const removeAttendee = (index: number) => {
    const updatedAttendees = attendees.filter((_, idx) => idx !== index);
    setAttendees(updatedAttendees);
    localStorage.setItem("planpilot_attendees", JSON.stringify(updatedAttendees));
  };

  const tabs = useMemo(
    () => [
      { key: "plan" as const, label: "Plan", icon: <span className="material-symbols-rounded">note_alt</span> },
      { key: "attendees" as const, label: "Attendees", icon: <span className="material-symbols-rounded">person</span> },
      { key: "emails" as const, label: "Emails", icon: <span className="material-symbols-rounded">mail</span> },
    ],
    [],
  );

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${PlanPageBg})` }}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.topPill}>
            <div className={styles.dropdown} role="button" tabIndex={0} aria-label="Select event type">
              <span className={styles.dropdownText}>Wedding</span>
            </div>

            {/* Sliding tabs */}
            <div className={styles.sliderGroup} role="tablist" aria-label="Primary navigation">
              {tabs.map((t) => {
                const isActive = t.key === activeTab;

                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={[styles.sliderItem, isActive ? styles.sliderItemActive : styles.sliderItemInactive].join(
                      " ",
                    )}
                    onClick={() => setActiveTab(t.key)}
                  >
                    <span className={styles.sliderIcon} aria-hidden="true">
                      {t.icon}
                    </span>
                    <span className={styles.sliderLabel}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.brand}>planpilot</div>
          <button 
            className={styles.avatar} 
            aria-label="Go to home"
            onClick={() => window.location.href = '/'}
          >
            <span className="material-symbols-rounded">home</span>
          </button>
        </div>
      </header>

      <main className={[styles.shell, activeTab !== "plan" ? styles.shellTwoCol : ""].join(" ")}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Assistant</div>

          <div className={styles.panelBody}>
            <p className={styles.bold}>I’ve created a rough event plan for you.</p>
            <p className={styles.muted}>
              Please check out the details on the second column, and make any adjustments as necessary.
            </p>
            <p className={styles.muted}>Feel free to ask me to help with anything else in this chat panel.</p>
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

        {activeTab === "plan" && (
          <section className={styles.panel}>
            <div className={styles.scheduleHeaderRow}>
              <div className={styles.scheduleTitle}>Schedule</div>
              <div className={styles.scheduleDate}>Fri 13/02/2026</div>
            </div>

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
        )}

        {activeTab === "attendees" && attendees.length > 0 && (
          <div className={styles.attendeesColumn}>
            <section className={[styles.panel, styles.attendeesPanel].join(" ")}>
              <div className={styles.attendeesHeader}>
                <h2 className={styles.attendeesCount}>{attendees.length} Attendees</h2>
                <button className={styles.addIconBtn} onClick={() => setShowAddModal(true)} aria-label="Add attendee">
                  <span className="material-symbols-rounded">add</span>
                </button>
              </div>
              
              <div className={styles.attendeesList}>
                {attendees.map((attendee, idx) => (
                  <div key={idx} className={styles.attendeeCard}>
                    <div className={styles.attendeeName}>{attendee.name}</div>
                    <div className={styles.attendeeEmail}>{attendee.email}</div>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => removeAttendee(idx)}
                      aria-label="Remove attendee"
                    >
                      <span className="material-symbols-rounded">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.attendeesButtonWrapper}>
              <button 
                className={styles.sendEmailBtn}
                onClick={() => {
                  setActiveTab("emails");
                  setEmailType("invites");
                  setShowEmailDraft(true);
                }}
              >
                Send Email Invites
              </button>
            </div>
          </div>
        )}

        {(activeTab === "plan" || (activeTab === "attendees" && attendees.length === 0) || activeTab === "emails") && (
          <section className={[styles.panel, styles.mainPanel, activeTab !== "plan" ? styles.mainPanelTransparent : ""].join(" ")}>
            {activeTab === "plan" && (
              <div className={styles.mainContent}>
                <h1 className={styles.mainHeading}>Just like that, you have a plan!</h1>
                <p className={styles.mainSub}>Check the columns to the left to dig deeper, modify and refine.</p>
              </div>
            )}

            {activeTab === "attendees" && attendees.length === 0 && (
              <div className={styles.mainContent}>
                <h1 className={styles.mainHeading}>Attendees Manager</h1>
                <p className={styles.mainSub}>A place to keep record of your attendees.</p>
                <button className={styles.addButton} onClick={() => setShowAddModal(true)}>Add People</button>
              </div>
            )}

            {activeTab === "emails" && attendees.length === 0 && (
              <div className={styles.mainContent}>
                <h1 className={styles.mainHeading}>Email Manager</h1>
                <p className={styles.mainSub}>We can send out batch emails for you.<br />Please add your list of attendees first!</p>
                <button className={styles.addButton} onClick={() => setActiveTab("attendees")}>Add in Attendees Mode</button>
              </div>
            )}

            {activeTab === "emails" && attendees.length > 0 && !showEmailDraft && (
              <div className={styles.emailContent}>
                <h1 className={styles.emailHeading}>Email Manager</h1>
                <p className={styles.emailSub}>We can send out batch emails for you.<br />What emails would you like to send out?</p>
                
                <div className={styles.emailButtons}>
                  <button 
                    className={styles.emailOptionBtn}
                    onClick={() => {
                      setEmailType("invites");
                      setShowEmailDraft(true);
                    }}
                  >
                    Invites
                  </button>
                  <button 
                    className={styles.emailOptionBtn}
                    onClick={() => {
                      setEmailType("status");
                      setShowEmailDraft(true);
                    }}
                  >
                    Status Update
                  </button>
                </div>
              </div>
            )}

            {activeTab === "emails" && showEmailDraft && (
              <div className={styles.draftContainer}>
                <div className={styles.draftBox}>
                  <div className={styles.draftHeader}>
                    <button 
                      className={styles.closeBtn}
                      onClick={() => setShowEmailDraft(false)}
                      aria-label="Close draft"
                    >
                      <span className="material-symbols-rounded">close</span>
                    </button>
                    <span className={styles.draftTitle}>Draft Email</span>
                    <div className={styles.draftActions}>
                      <button className={styles.editAttendeesBtn} onClick={() => setActiveTab("attendees")}>
                        Edit Attendees
                      </button>
                      <button className={styles.sendEmailsBtn}>
                        Send Emails to {attendees.length} People
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.draftBody}>
                    <div className={styles.llmLabel}>LLM OUTPUT</div>
                    <div className={styles.llmOutput}>
                      {/* Email content will be generated here */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add Attendee</h2>
            
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Name</label>
              <input
                type="text"
                className={styles.modalInput}
                placeholder="Enter attendee name"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Email</label>
              <input
                type="email"
                className={styles.modalInput}
                placeholder="Enter attendee email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
              />
            </div>

            <div className={styles.modalButtons}>
              <button 
                className={styles.modalBtnCancel} 
                onClick={() => {
                  setShowAddModal(false);
                  setAttendeeName("");
                  setAttendeeEmail("");
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.modalBtnAdd}
                onClick={addAttendee}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}