import { useState, useEffect } from "react";
import styles from "../pages/PlanPage.module.css";
import { EventPlan } from "../api";

interface EmailManagerProps {
  plan: EventPlan;
  onSwitchTab: (tab: "attendees") => void;
  onAddLog: (message: string) => void;
}

interface InviteResult {
  bookingId: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "declined";
}

export default function EmailManager({
  plan,
  onSwitchTab,
  onAddLog,
}: EmailManagerProps) {
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [emailType, setEmailType] = useState<"invites" | "status" | "">("");
  const [isSending, setIsSending] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Don't auto-fetch when countdown reaches 0 - wait for user to click "See Results"
  }, [showCountdown, countdown]);

  const fetchFinalStatuses = async () => {
    onAddLog("Timer ended. Fetching final RSVP statuses...");
    
    try {
      // Collect all bookingIds
      const bookingIds = inviteResults.map(invite => invite.bookingId);
      
      onAddLog(`Sending bookingIds: ${JSON.stringify(bookingIds)}`);
      
      // Single API call with all bookingIds
      const response = await fetch('https://samuelrath.app.n8n.cloud/webhook/Finalise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds }),
      });
      
      if (response.ok) {
        // Get raw text first
        const rawText = await response.text();
        console.log('Raw finalise response:', rawText);
        onAddLog(`Raw response: ${rawText}`);
        
        if (!rawText || rawText.trim() === '') {
          onAddLog('Error: Empty response from n8n');
          alert('n8n returned empty response. Check your "Respond to Webhook" node.');
          return;
        }
        
        try {
          const data = JSON.parse(rawText);
          
          console.log('Parsed finalise response:', data);
          onAddLog(`Results: ${data.acceptedCount} accepted, ${data.declinedCount} declined`);
          
          // Map results back to invites
          const updatedResults = inviteResults.map(invite => {
            const result = data.results.find((r: any) => r.bookingId === invite.bookingId);
            return {
              ...invite,
              status: result?.finalStatus || "declined",
            };
          });
          
          setInviteResults(updatedResults);
          setShowCountdown(false);
          setShowResults(true);
          onAddLog("RSVP collection complete!");
        } catch (parseError) {
          onAddLog(`Failed to parse JSON. Response was: ${rawText}`);
          alert('n8n response is not valid JSON. Check your workflow.');
        }
      } else {
        onAddLog(`Error: ${response.status} ${response.statusText}`);
        alert('Failed to fetch results. Check assistant panel.');
      }
    } catch (error) {
      console.error('Error fetching final statuses:', error);
      onAddLog(`Error: ${String(error)}`);
      alert('An error occurred while fetching results.');
    }
  };

  const handleSendInvites = async () => {
    setIsSending(true);
    onAddLog(`Sending invites to ${plan.attendees.length} attendees...`);

    try {
      const results: InviteResult[] = [];
      
      // Send invite for each attendee
      for (const attendee of plan.attendees) {
        try {
          const response = await fetch('https://samuelrath.app.n8n.cloud/webhook/create-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: attendee.name,
              email: attendee.email,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            
            // Strip the "=" prefix if n8n returns it
            const cleanBookingId = typeof result.bookingId === 'string' 
              ? result.bookingId.replace(/^=/, '') 
              : result.bookingId;
            
            results.push({
              bookingId: cleanBookingId,
              name: attendee.name,
              email: attendee.email,
              status: result.status || "pending",
            });
            onAddLog(`✓ Invite sent to ${attendee.name}`);
          } else {
            onAddLog(`✗ Failed to send invite to ${attendee.name}`);
          }
        } catch (error) {
          onAddLog(`✗ Error sending invite to ${attendee.name}`);
        }
      }

      const successCount = results.length;
      onAddLog(`Completed: ${successCount}/${plan.attendees.length} invites sent successfully`);
      
      if (successCount > 0) {
        setInviteResults(results);
        setShowEmailDraft(false);
        setShowCountdown(true);
        setCountdown(30);
        onAddLog("Starting 30-second RSVP countdown...");
      } else {
        alert('Failed to send invites. Check the assistant panel for details.');
      }
    } catch (error) {
      console.error('Error sending invites:', error);
      onAddLog(`Error: ${String(error)}`);
      alert('An error occurred while sending invites.');
    } finally {
      setIsSending(false);
    }
  };

  const resetEmailManager = () => {
    setShowCountdown(false);
    setShowResults(false);
    setInviteResults([]);
    setCountdown(30);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>Email Manager</div>

      {showCountdown ? (
        // Countdown View
        <div className={styles.emptyState} style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "72px", margin: "0", color: "#E4B5FF" }}>
            {countdown}
          </h2>
          <p className={styles.muted} style={{ fontSize: "20px", marginTop: "20px" }}>
            {countdown > 0 ? "Waiting for responses..." : "Time's up!"}
          </p>
          <p className={styles.muted} style={{ fontSize: "14px" }}>
            {countdown > 0 
              ? "Attendees can click Yes or No in their emails"
              : "Click below to see the final results"
            }
          </p>
          
          {countdown === 0 && (
            <button
              onClick={fetchFinalStatuses}
              style={{
                marginTop: "30px",
                padding: "14px 32px",
                borderRadius: "12px",
                background: "#E4B5FF",
                color: "#111",
                border: "none",
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "transform 150ms ease, filter 150ms ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.filter = "brightness(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              See Results
            </button>
          )}
        </div>
      ) : showResults ? (
        // Results Table View
        <div className={styles.planContent}>
          <h3 style={{ color: "#fff", marginBottom: "20px" }}>RSVP Results</h3>
          
          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden"
          }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              color: "#fff"
            }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inviteResults.map((result, idx) => (
                  <tr key={result.bookingId} style={{ 
                    borderBottom: idx < inviteResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                  }}>
                    <td style={{ padding: "12px" }}>{result.name}</td>
                    <td style={{ padding: "12px", color: "rgba(255,255,255,0.7)" }}>{result.email}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: result.status === "accepted" 
                          ? "rgba(76, 175, 80, 0.2)" 
                          : result.status === "declined"
                          ? "rgba(244, 67, 54, 0.2)"
                          : "rgba(255, 152, 0, 0.2)",
                        color: result.status === "accepted" 
                          ? "#4CAF50" 
                          : result.status === "declined"
                          ? "#F44336"
                          : "#FF9800"
                      }}>
                        {result.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "space-between" }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Accepted: {inviteResults.filter(r => r.status === "accepted").length} | 
              Declined: {inviteResults.filter(r => r.status === "declined").length}
            </div>
            <button
              onClick={resetEmailManager}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Send New Invites
            </button>
          </div>
        </div>
      ) : plan.attendees.length === 0 ? (
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
              Send Invites
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
              background: isSending ? "#999" : "#E4B5FF",
              color: "#000",
              fontWeight: "bold",
              cursor: isSending ? "not-allowed" : "pointer",
            }}
            onClick={handleSendInvites}
            disabled={isSending}
          >
            {isSending ? `Sending...` : `Send to ${plan.attendees.length} Attendees`}
          </button>
        </div>
      )}
    </section>
  );
}
