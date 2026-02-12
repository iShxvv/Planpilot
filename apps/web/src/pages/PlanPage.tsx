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

type TabKey = "plan" | "attendees" | "tasks";

export default function PlanPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(createEmptyPlan());
  const [activeTab, setActiveTab] = useState<TabKey>("plan");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await sendPlanMessage(userMessage, currentPlan);
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

  const tabs = [
    { key: "plan" as const, label: "Plan", icon: "note_alt" },
    { key: "attendees" as const, label: "Attendees", icon: "person" },
    { key: "tasks" as const, label: "Tasks", icon: "checklist" },
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
                      {currentPlan.eventMetadata.budget?.total && (
                        <div className={styles.metadataItem}>
                          <span className={styles.metadataLabel}>Budget</span>
                          <span className={styles.metadataValue}>
                            {currentPlan.eventMetadata.budget.currency} {currentPlan.eventMetadata.budget.total.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentPlan.schedule.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Schedule</h3>
                      {currentPlan.schedule.map((item) => (
                        <div key={item.id} className={styles.scheduleCard}>
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
                      {currentPlan.vendors.map((vendor) => (
                        <div key={vendor.id} className={styles.vendorCard}>
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
            <div className={styles.panelHeader}>Attendees ({currentPlan.attendees.length})</div>
            <div className={styles.attendeesList}>
              {currentPlan.attendees.length === 0 ? (
                <p className={styles.muted}>No attendees yet. Ask the AI to add some!</p>
              ) : (
                currentPlan.attendees.map((attendee) => (
                  <div key={attendee.id} className={styles.attendeeCard}>
                    <div className={styles.attendeeName}>{attendee.name}</div>
                    <div className={styles.attendeeEmail}>{attendee.email}</div>
                    {attendee.rsvpStatus && (
                      <div className={`${styles.statusBadge} ${styles[`status-${attendee.rsvpStatus}`]}`}>{attendee.rsvpStatus}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "tasks" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>Tasks ({currentPlan.tasks.length})</div>
            <div className={styles.tasksList}>
              {currentPlan.tasks.length === 0 ? (
                <p className={styles.muted}>No tasks yet. The AI will help you create a checklist!</p>
              ) : (
                currentPlan.tasks.map((task) => (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskHeader}>
                      <div className={styles.taskTitle}>{task.title}</div>
                      <div className={`${styles.statusBadge} ${styles[`status-${task.status}`]}`}>{task.status}</div>
                    </div>
                    {task.description && <div className={styles.muted}>{task.description}</div>}
                    {task.dueDate && <div className={styles.taskDue}>Due: {task.dueDate}</div>}
                    {task.priority && <div className={`${styles.priorityBadge} ${styles[`priority-${task.priority}`]}`}>{task.priority}</div>}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
