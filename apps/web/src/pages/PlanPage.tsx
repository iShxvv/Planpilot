// PlanPage.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./PlanPage.module.css";
import {
  sendEventMessage,
  EventPlannerResponse,
  ResearchItem,
  ScheduleItem,
  EventState
} from "../api";

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: EventPlannerResponse;
}

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

// Research List Component
function ResearchList({ title, items }: { title?: string; items: ResearchItem[] }) {
  return (
    <div className={styles.researchList}>
      {title && <div className={styles.researchTitle}>{title}</div>}
      <div className={styles.researchItems}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.researchCard}>
            {item.image_url && (
              <div className={styles.researchImage} style={{ backgroundImage: `url(${item.image_url})` }} />
            )}
            <div className={styles.researchContent}>
              <div className={styles.researchType}>{item.type}</div>
              <div className={styles.researchName}>{item.name}</div>
              <div className={styles.researchDesc}>{item.description}</div>
              <div className={styles.researchMeta}>
                <span className={styles.researchCost}>{item.cost}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.researchLink}>
                    View Details →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Schedule View Component
function ScheduleView({ title, items }: { title?: string; items: ScheduleItem[] }) {
  return (
    <div className={styles.scheduleView}>
      {title && <div className={styles.scheduleViewTitle}>{title}</div>}
      <div className={styles.scheduleItems}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.scheduleCard}>
            <div className={styles.scheduleTime}>{item.time}</div>
            <div className={styles.scheduleDetails}>
              <div className={styles.scheduleActivity}>{item.activity}</div>
              {item.notes && <div className={styles.scheduleNotes}>{item.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventState, setEventState] = useState<EventState>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle initial response from form submission
    const initialResponse = location.state?.initialResponse;
    const formData = location.state?.formData;

    if (initialResponse) {
      const assistantMessage: Message = {
        role: "assistant",
        content: initialResponse.user_reply,
        response: initialResponse,
      };
      setMessages([assistantMessage]);

      // Update event state if provided
      if (initialResponse.data?.event_state) {
        setEventState(initialResponse.data.event_state);
      } else if (formData) {
        // Fallback to form data if no event state in response
        setEventState({
          type: formData.eventType,
          date: formData.eventDateRange,
          location: formData.eventLocation,
          guests: parseInt(formData.numberOfAttendees) || 0,
          budget: formData.budget,
        });
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendEventMessage(inputValue);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.user_reply,
        response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update event state if provided
      if (response.data?.event_state) {
        setEventState((prev) => ({ ...prev, ...response.data!.event_state }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.topPill}>
            <div className={styles.dropdown} role="button" tabIndex={0} aria-label="Select event type">
              <span className={styles.dropdownText}>{eventState.type || "New Event"}</span>
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
        {/* Assistant Chat Panel */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Assistant</div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.bold}>Welcome to PlanPilot!</p>
                <p className={styles.muted}>Ask me anything about your event planning.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={msg.role === "user" ? styles.userMessage : styles.assistantMessage}>
                  <div className={styles.messageContent}>{msg.content}</div>

                  {/* Render structured data for assistant messages */}
                  {msg.role === "assistant" && msg.response?.ui_type === "research_list" && msg.response.data?.items && (
                    <ResearchList
                      title={msg.response.data.title}
                      items={msg.response.data.items as ResearchItem[]}
                    />
                  )}

                  {msg.role === "assistant" && msg.response?.ui_type === "schedule_view" && msg.response.data?.items && (
                    <ScheduleView
                      title={msg.response.data.title}
                      items={msg.response.data.items as ScheduleItem[]}
                    />
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className={styles.assistantMessage}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatRow}>
            <input
              className={styles.chatInput}
              placeholder="Ask Anything..."
              aria-label="Ask anything"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className={styles.chatSend}
              type="button"
              aria-label="Send message"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
            >
              →
            </button>
          </div>
        </section>

        {/* Event Details Panel */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Event Details</div>
          <div className={styles.eventDetails}>
            {eventState.type && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Type</div>
                <div className={styles.detailValue}>{eventState.type}</div>
              </div>
            )}
            {eventState.date && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Date</div>
                <div className={styles.detailValue}>{eventState.date}</div>
              </div>
            )}
            {eventState.location && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Location</div>
                <div className={styles.detailValue}>{eventState.location}</div>
              </div>
            )}
            {eventState.guests && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Guests</div>
                <div className={styles.detailValue}>{eventState.guests}</div>
              </div>
            )}
            {eventState.budget && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Budget</div>
                <div className={styles.detailValue}>{eventState.budget}</div>
              </div>
            )}
            {Object.keys(eventState).length === 0 && (
              <div className={styles.muted}>No event details yet. Submit the form to get started!</div>
            )}
          </div>
        </section>

        {/* Main Content Panel */}
        <section className={[styles.panel, styles.mainPanel].join(" ")}>
          <div className={styles.mainContent}>
            <h1 className={styles.mainHeading}>Your Event Planning Assistant is Ready</h1>
            <p className={styles.mainSub}>
              Use the chat panel to ask questions, get recommendations, view schedules, and manage your event in real-time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}