import { useState } from "react";
import styles from "../pages/PlanPage.module.css";
import { EventPlan, AttendeeItem as AttendeeType } from "../api";

interface AttendeesManagerProps {
  plan: EventPlan;
  onUpdatePlan: (plan: EventPlan) => void;
}

export default function AttendeesManager({ plan, onUpdatePlan }: AttendeesManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");

  const addAttendee = async () => {
    if (!attendeeName.trim() || !attendeeEmail.trim()) return;

    // Optimistic update
    const newAttendee: AttendeeType = {
      id: Date.now().toString(),
      name: attendeeName,
      email: attendeeEmail,
      rsvpStatus: "invited",
    };

    const updatedPlan = {
      ...plan,
      attendees: [...plan.attendees, newAttendee],
    };

    onUpdatePlan(updatedPlan);

    setShowAddModal(false);
    setAttendeeName("");
    setAttendeeEmail("");
  };

  const removeAttendee = (index: number) => {
    const updatedAttendees = plan.attendees.filter(
      (_, idx) => idx !== index
    );
    const updatedPlan = { ...plan, attendees: updatedAttendees };
    onUpdatePlan(updatedPlan);
  };

  return (
    <>
      <section className={styles.panel}>
        <div
          className={styles.panelHeader}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>Attendees ({plan.attendees.length})</span>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "none",
              border: "none",
              color: "#E4B5FF",
              cursor: "pointer",
              fontSize: "24px",
            }}
          >
            <span className="material-symbols-rounded">add_circle</span>
          </button>
        </div>
        <div className={styles.attendeesList}>
          {plan.attendees.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <p className={styles.muted}>No attendees yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: "#E4B5FF",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Add Manual Attendee
              </button>
            </div>
          ) : (
            plan.attendees.map((attendee, idx) => (
              <AttendeeItem
                key={attendee.id || idx}
                attendee={attendee}
                onRemove={() => removeAttendee(idx)}
              />
            ))
          )}
        </div>
      </section>

      {/* Modal for adding attendees manually */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#2D2235",
              padding: "30px",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "400px",
              border: "1px solid rgba(228, 181, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: "#fff" }}>Add Attendee</h2>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "8px", color: "#ccc" }}
              >
                Name
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: "16px",
                }}
                placeholder="Enter name"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{ display: "block", marginBottom: "8px", color: "#ccc" }}
              >
                Email
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: "16px",
                }}
                placeholder="Enter email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #666",
                  color: "#ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={addAttendee}
                style={{
                  padding: "10px 20px",
                  background: "#E4B5FF",
                  border: "none",
                  color: "#000",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AttendeeItem({
  attendee,
  onRemove,
}: {
  attendee: AttendeeType;
  onRemove: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.attendeeCard}>
      <div className={styles.attendeeName}>{attendee.name}</div>
      <div className={styles.attendeeEmail}>{attendee.email}</div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onRemove}
        className={`${styles.statusBadge} ${
          styles[`status-${attendee.rsvpStatus}`]
        }`}
        style={{
          cursor: "pointer",
          transition: "all 0.2s ease",
          backgroundColor: isHovered ? "rgba(244, 67, 54, 0.2)" : undefined,
          color: isHovered ? "#ef5350" : undefined,
          borderColor: isHovered ? "rgba(244, 67, 54, 0.3)" : undefined,
          minWidth: "90px",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {isHovered ? "Uninvite" : attendee.rsvpStatus || "INVITED"}
      </div>
    </div>
  );
}
