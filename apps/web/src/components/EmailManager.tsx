import { useState } from "react";
import styles from "../pages/PlanPage.module.css";
import { EventPlan } from "../api";

interface EmailManagerProps {
  plan: EventPlan;
  onSwitchTab: (tab: "attendees") => void;
  onAddLog: (message: string) => void;
}

export default function EmailManager({
  plan,
  onSwitchTab,
  onAddLog,
}: EmailManagerProps) {
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [emailType, setEmailType] = useState<"invites" | "status" | "">("");

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>Email Manager</div>

      {plan.attendees.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Attendees Yet</h3>
          <p className={styles.muted}>
            Please add attendees before sending emails.
          </p>
          <button
            className={styles.chatSend}
            style={{
              width: "auto",
              padding: "10px 20px",
              marginTop: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#E4B5FF",
              color: "#000",
            }}
            onClick={() => {
              onSwitchTab("attendees");
            }}
          >
            Add Attendees
          </button>
        </div>
      ) : !showEmailDraft ? (
        <div className={styles.planContent}>
          <p className={styles.muted} style={{ marginBottom: "20px" }}>
            Ready to send updates to your {plan.attendees.length} attendees?
          </p>

          <div
            className={styles.emailButtons}
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              className={styles.suggestionLink}
              style={{
                padding: "12px 24px",
                cursor: "pointer",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => {
                setEmailType("invites");
                setShowEmailDraft(true);
                onAddLog(`Creating draft invitation email...`);
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ marginRight: "8px" }}
              >
                mail
              </span>
              Draft Invites
            </button>

            <button
              className={styles.suggestionLink}
              style={{
                padding: "12px 24px",
                cursor: "pointer",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => {
                setEmailType("status");
                setShowEmailDraft(true);
                onAddLog(`Creating draft status update...`);
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ marginRight: "8px" }}
              >
                update
              </span>
              Status Update
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.planContent}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0, color: "#fff" }}>
              Drafting:{" "}
              {emailType === "invites" ? "Invitations" : "Status Update"}
            </h3>
            <button
              onClick={() => setShowEmailDraft(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                fontFamily: "monospace",
                color: "#eee",
                lineHeight: "1.5",
              }}
            >
              Subject: You're invited to{" "}
              {plan.eventMetadata.title || "Our Event"}!
              <br />
              <br />
              Hi [Name],
              <br />
              <br />
              We are thrilled to invite you to our celebration in{" "}
              {plan.eventMetadata.location?.city || "Melbourne"}.
              <br />
              <br />
              Date: {plan.eventMetadata.date || "TBD"}
              <br />
              Location: {plan.eventMetadata.location?.venue || "TBD"}
              <br />
              <br />
              Please RSVP at your earliest convenience.
              <br />
              <br />
              Best,
              <br />
              PlanPilot Team
            </p>
          </div>

          <button
            className={styles.chatSend}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "20px",
              borderRadius: "8px",
              background: "#E4B5FF",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              alert(`Emails sent to ${plan.attendees.length} attendees!`);
              setShowEmailDraft(false);
            }}
          >
            Send to {plan.attendees.length} Attendees
          </button>
        </div>
      )}
    </section>
  );
}
