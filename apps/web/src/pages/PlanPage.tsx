import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PlanPage.module.css";
import PlanPageBg from "../assets/images/theme_Background.png";
import {
  EventPlan,
  loadPlanFromStorage,
  savePlanToStorage,
  sendPlanMessage,
  createEmptyPlan,
} from "../api";

type TabKey = "plan" | "attendees" | "emails";

export default function PlanPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(createEmptyPlan());
  const [activeTab, setActiveTab] = useState<TabKey>("plan");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [emailType, setEmailType] = useState<"invites" | "status" | "">("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedPlan = loadPlanFromStorage();
    if (storedPlan && storedPlan.version > 0) {
      setCurrentPlan(storedPlan);
      const chatHistory = storedPlan.aiContext.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      setChatMessages(chatHistory);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      console.log("Current Plan State before send:", currentPlan);
      const response = await sendPlanMessage(userMessage, currentPlan);

      console.log("n8n Response updatedPlan:", response.updatedPlan);

      setCurrentPlan(response.updatedPlan);
      savePlanToStorage(response.updatedPlan);

      setChatMessages((prev) => [...prev, { role: "assistant", content: response.userReply }]);
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addAttendee = async () => {
    if (!attendeeName.trim() || !attendeeEmail.trim()) return;

    // Optimistic update
    const newAttendee = {
      id: Date.now().toString(),
      name: attendeeName,
      email: attendeeEmail,
      rsvpStatus: "invited" as const
    };

    const updatedPlan = {
      ...currentPlan,
      attendees: [...currentPlan.attendees, newAttendee]
    };

    setCurrentPlan(updatedPlan);
    savePlanToStorage(updatedPlan);

    setShowAddModal(false);
    setAttendeeName("");
    setAttendeeEmail("");

    // Sync with AI context if needed (optional)
  };

  const removeAttendee = (index: number) => {
    const updatedAttendees = currentPlan.attendees.filter((_, idx) => idx !== index);
    const updatedPlan = { ...currentPlan, attendees: updatedAttendees };
    setCurrentPlan(updatedPlan);
    savePlanToStorage(updatedPlan);
  };

  const tabs = [
    { key: "plan" as const, label: "Plan", icon: "note_alt" },
    { key: "attendees" as const, label: "Attendees", icon: "person" },
    { key: "emails" as const, label: "Emails", icon: "mail" },
  ];

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${PlanPageBg})` }}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.topPill}>
            <div className={styles.dropdown}>
              <span className={styles.dropdownText}>{currentPlan.eventMetadata?.type || "New Event"}</span>
            </div>
            <div className={styles.sliderGroup}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  className={`${styles.sliderItem} ${t.key === activeTab ? styles.sliderItemActive : styles.sliderItemInactive}`}
                  onClick={() => setActiveTab(t.key)}
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
          <button className={styles.avatar} onClick={() => navigate("/")}>
            <span className="material-symbols-rounded">home</span>
          </button>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Assistant</div>
          <div className={styles.chatMessages}>
            {chatMessages.length === 0 && (
              <p className={styles.muted}>Tell me about your event to get started!</p>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? styles.chatMessageUser : styles.chatMessageAssistant}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className={styles.chatMessageAssistant}>
                <span className={styles.typingIndicator}>...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.chatRow}>
            <input
              className={styles.chatInput}
              placeholder="Describe your event..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              disabled={isLoading}
            />
            <button className={styles.chatSend} onClick={handleSendMessage} disabled={isLoading} />
          </div>
        </section>

        {activeTab === "plan" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>Event Overview</div>
            <div className={styles.planContent}>
              {currentPlan.eventMetadata.title ? (
                <>
                  <div className={styles.metadataCard}>
                    <h2 className={styles.eventTitle}>{currentPlan.eventMetadata.title}</h2>
                    {currentPlan.eventMetadata.description && <p className={styles.muted}>{currentPlan.eventMetadata.description}</p>}
                    <div className={styles.metadataGrid}>
                      {currentPlan.eventMetadata.date && (
                        <div className={styles.metadataItem}>
                          <span className={styles.metadataLabel}>Date</span>
                          <span className={styles.metadataValue}>{currentPlan.eventMetadata.date}</span>
                        </div>
                      )}
                      {currentPlan.eventMetadata.location?.city && (
                        <div className={styles.metadataItem}>
                          <span className={styles.metadataLabel}>Location</span>
                          <span className={styles.metadataValue}>
                            {currentPlan.eventMetadata.location.venue || currentPlan.eventMetadata.location.city}
                          </span>
                        </div>
                      )}
                      {currentPlan.eventMetadata.guestCount && (
                        <div className={styles.metadataItem}>
                          <span className={styles.metadataLabel}>Guests</span>
                          <span className={styles.metadataValue}>{currentPlan.eventMetadata.guestCount}</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {currentPlan.schedule.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Schedule</h3>
                      {currentPlan.schedule.map((item, idx) => (
                        <div key={item.id || idx} className={styles.scheduleCard}>
                          <div className={styles.scheduleTime}>{item.time}</div>
                          <div className={styles.scheduleDetails}>
                            <div className={styles.scheduleActivity}>{item.activity}</div>
                            {item.location && <div className={styles.scheduleLocation}>{item.location}</div>}
                            {item.notes && <div className={styles.muted}>{item.notes}</div>}
                          </div>
                          {item.status && <div className={`${styles.statusBadge} ${styles[`status-${item.status}`]}`}>{item.status}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentPlan.vendors.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Vendors</h3>
                      {currentPlan.vendors.map((vendor, idx) => (
                        <div key={vendor.id || idx} className={styles.vendorCard}>
                          <div className={styles.vendorHeader}>
                            <div>
                              <div className={styles.vendorCategory}>{vendor.category}</div>
                              <div className={styles.vendorName}>{vendor.name || "Researching..."}</div>
                            </div>
                            <div className={`${styles.statusBadge} ${styles[`status-${vendor.status}`]}`}>{vendor.status}</div>
                          </div>
                          {vendor.description && <p className={styles.muted}>{vendor.description}</p>}
                          {vendor.cost && (
                            <div className={styles.vendorCost}>
                              {vendor.currency} {vendor.cost.toLocaleString()}
                            </div>
                          )}
                          {vendor.researchSuggestions && vendor.researchSuggestions.length > 0 && (
                            <div className={styles.researchSection}>
                              <div className={styles.researchTitle}>Suggestions:</div>
                              {vendor.researchSuggestions.map((suggestion, idx) => (
                                <div key={idx} className={styles.suggestionCard}>
                                  <div className={styles.suggestionName}>{suggestion.name}</div>
                                  <div className={styles.suggestionDescription}>{suggestion.description}</div>
                                  {suggestion.estimatedCost && (
                                    <div className={styles.suggestionCost}>
                                      ~{suggestion.currency} {suggestion.estimatedCost.toLocaleString()}
                                    </div>
                                  )}
                                  {suggestion.reasoning && <div className={styles.suggestionReasoning}>{suggestion.reasoning}</div>}
                                  {suggestion.link && (
                                    <a href={suggestion.link} target="_blank" rel="noopener noreferrer" className={styles.suggestionLink}>
                                      View Details →
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h2>Start Planning Your Event</h2>
                  <p>Chat with the AI to create your event plan</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "attendees" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Attendees ({currentPlan.attendees.length})</span>
              <button onClick={() => setShowAddModal(true)} style={{ background: 'none', border: 'none', color: '#E4B5FF', cursor: 'pointer', fontSize: '24px' }}>
                <span className="material-symbols-rounded">add_circle</span>
              </button>
            </div>
            <div className={styles.attendeesList}>
              {currentPlan.attendees.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <p className={styles.muted}>No attendees yet.</p>
                  <button onClick={() => setShowAddModal(true)} style={{ background: '#E4B5FF', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Add Manual Attendee
                  </button>
                </div>
              ) : (
                currentPlan.attendees.map((attendee, idx) => (
                  <AttendeeItem
                    key={attendee.id || idx}
                    attendee={attendee}
                    onRemove={() => removeAttendee(idx)}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "emails" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>Email Manager</div>

            {currentPlan.attendees.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No Attendees Yet</h3>
                <p className={styles.muted}>Please add attendees before sending emails.</p>
                <button className={styles.chatSend} style={{ width: 'auto', padding: '10px 20px', marginTop: '10px', borderRadius: '8px', cursor: 'pointer', background: '#E4B5FF', color: '#000' }} onClick={() => { setActiveTab("attendees"); setShowAddModal(true); }}>
                  Add Attendees
                </button>
              </div>
            ) : !showEmailDraft ? (
              <div className={styles.planContent}>
                <p className={styles.muted} style={{ marginBottom: '20px' }}>
                  Ready to send updates to your {currentPlan.attendees.length} attendees?
                </p>

                <div className={styles.emailButtons} style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className={styles.suggestionLink}
                    style={{ padding: '12px 24px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                    onClick={() => {
                      setEmailType("invites");
                      setShowEmailDraft(true);
                      setChatMessages(prev => [...prev, { role: 'assistant', content: `Creating draft invitation email...` }]);
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ marginRight: '8px' }}>mail</span>
                    Draft Invites
                  </button>

                  <button
                    className={styles.suggestionLink}
                    style={{ padding: '12px 24px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                    onClick={() => {
                      setEmailType("status");
                      setShowEmailDraft(true);
                      setChatMessages(prev => [...prev, { role: 'assistant', content: `Creating draft status update...` }]);
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ marginRight: '8px' }}>update</span>
                    Status Update
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.planContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Drafting: {emailType === 'invites' ? 'Invitations' : 'Status Update'}</h3>
                  <button onClick={() => setShowEmailDraft(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontFamily: 'monospace', color: '#eee', lineHeight: '1.5' }}>
                    Subject: You're invited to {currentPlan.eventMetadata.title || "Our Event"}!
                    <br /><br />
                    Hi [Name],
                    <br /><br />
                    We are thrilled to invite you to our celebration in {currentPlan.eventMetadata.location?.city || "Melbourne"}.
                    <br /><br />
                    Date: {currentPlan.eventMetadata.date || "TBD"}
                    <br />
                    Location: {currentPlan.eventMetadata.location?.venue || "TBD"}
                    <br /><br />
                    Please RSVP at your earliest convenience.
                    <br /><br />
                    Best,<br />
                    PlanPilot Team
                  </p>
                </div>

                <button
                  className={styles.chatSend}
                  style={{ width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', background: '#E4B5FF', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    alert(`Emails sent to ${currentPlan.attendees.length} attendees!`);
                    setShowEmailDraft(false);
                  }}
                >
                  Send to {currentPlan.attendees.length} Attendees
                </button>
              </div>
            )}
          </section>
        )}

        {/* Modal for adding attendees manually */}
        {showAddModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={() => setShowAddModal(false)}>
            <div style={{
              background: '#2D2235', padding: '30px', borderRadius: '16px',
              width: '90%', maxWidth: '400px', border: '1px solid rgba(228, 181, 255, 0.2)'
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginTop: 0, color: '#fff' }}>Add Attendee</h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Name</label>
                <input
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px' }}
                  placeholder="Enter name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Email</label>
                <input
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px' }}
                  placeholder="Enter email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #666', color: '#ccc', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addAttendee}
                  style={{ padding: '10px 20px', background: '#E4B5FF', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}



      </main>
    </div>
  );
}

function AttendeeItem({ attendee, onRemove }: { attendee: any, onRemove: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.attendeeCard}>
      <div className={styles.attendeeName}>{attendee.name}</div>
      <div className={styles.attendeeEmail}>{attendee.email}</div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onRemove}
        className={`${styles.statusBadge} ${styles[`status-${attendee.rsvpStatus}`]}`}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isHovered ? 'rgba(244, 67, 54, 0.2)' : undefined,
          color: isHovered ? '#ef5350' : undefined,
          borderColor: isHovered ? 'rgba(244, 67, 54, 0.3)' : undefined,
          minWidth: '90px',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        {isHovered ? "Uninvite" : (attendee.rsvpStatus || "INVITED")}
      </div>
    </div>
  );
}
