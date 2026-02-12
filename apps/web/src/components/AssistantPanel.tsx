import { useRef, useEffect, useState } from "react";
import styles from "../pages/PlanPage.module.css";

interface AssistantPanelProps {
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function AssistantPanel({
  chatMessages,
  isLoading,
  onSendMessage,
}: AssistantPanelProps) {
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!userInput.trim() || isLoading) return;
    onSendMessage(userInput);
    setUserInput("");
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>Assistant</div>
      <div className={styles.chatMessages}>
        {chatMessages.length === 0 && (
          <p className={styles.muted}>
            Tell me about your event to get started!
          </p>
        )}
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? styles.chatMessageUser
                : styles.chatMessageAssistant
            }
          >
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
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
          }
          disabled={isLoading}
        />
        <button
          className={styles.chatSend}
          onClick={handleSend}
          disabled={isLoading}
        />
      </div>
    </section>
  );
}
