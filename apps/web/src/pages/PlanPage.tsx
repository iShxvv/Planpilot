import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./PlanPage.module.css";
import PlanPageBg from "../assets/images/theme_Background.png";

import PlanOverview from "../components/PlanOverview";
import AttendeesManager from "../components/AttendeesManager";
import EmailManager from "../components/EmailManager";
import BudgetOverview from "../components/BudgetOverview";
import AssistantPanel from "../components/AssistantPanel";
import PlanHeader from "../components/PlanHeader";

import {
  EventPlan,
  loadPlanFromStorage,
  savePlanToStorage,
  createEmptyPlan,
} from "../api";
import { usePlanChat, ChatMessage } from "../hooks/usePlanChat";

type TabKey = "plan" | "attendees" | "emails" | "budget";

export default function PlanPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(createEmptyPlan());
  const [activeTab, setActiveTab] = useState<TabKey>("plan");

  const handleUpdatePlan = (updatedPlan: EventPlan) => {
    setCurrentPlan(updatedPlan);
    savePlanToStorage(updatedPlan);
  };

  const {
    chatMessages,
    isLoading,
    isBudgetLoading,
    sendMessage,
    setChatMessages,
    addLogMessage,
  } = usePlanChat(currentPlan, handleUpdatePlan);

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    // Load plan by ID
    let storedPlan = loadPlanFromStorage(id);

    if (!storedPlan) {
      // If not found, create a new one with this ID (assuming valid flow from FormPage)
      storedPlan = createEmptyPlan();
      storedPlan.planId = id;
      savePlanToStorage(storedPlan);
    }

    setCurrentPlan(storedPlan);

    // Restore chat history
    if (storedPlan.aiContext?.conversationHistory) {
      const chatHistory: ChatMessage[] = storedPlan.aiContext.conversationHistory.map(
        (msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      );
      setChatMessages(chatHistory);
    }
  }, [id, setChatMessages]);

  // Handle initial message from FormPage
  useEffect(() => {
    // Only run if we have a plan loaded with the correct ID
    if (currentPlan.planId === id && !initializedRef.current) {
      const initialPrompt = location.state?.initialPrompt;

      // Also check legacy localStorage for backward compat or if state was lost
      const legacyPrompt = localStorage.getItem("planpilot_initial_message");

      const promptToRun = initialPrompt || legacyPrompt;

      if (promptToRun) {
        initializedRef.current = true;

        // Clear legacy
        if (legacyPrompt) localStorage.removeItem("planpilot_initial_message");

        // Clear state (replace history so back button doesn't re-trigger)
        navigate(location.pathname, { replace: true, state: {} });

        // Send message
        setTimeout(() => {
          sendMessage(promptToRun);
        }, 100);
      }
    }
  }, [currentPlan, id, location.state, navigate, sendMessage]);

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${PlanPageBg})` }}
    >
      <PlanHeader
        plan={currentPlan}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onNavigateHome={() => navigate("/")}
      />

      <main
        className={`${styles.shell} ${activeTab === "budget" ? styles.shellThreeCol : ""
          }`}
      >
        <AssistantPanel
          chatMessages={chatMessages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />

        {activeTab === "plan" && (
          <PlanOverview
            plan={currentPlan}
            onSendAction={sendMessage}
            onUpdatePlan={handleUpdatePlan}
            isLoading={isLoading && !currentPlan.eventMetadata?.title}
          />
        )}

        {activeTab === "attendees" && (
          <AttendeesManager
            plan={currentPlan}
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {activeTab === "emails" && (
          <EmailManager
            plan={currentPlan}
            onSwitchTab={(tab) => setActiveTab(tab)}
            onAddLog={addLogMessage}
          />
        )}

        {activeTab === "budget" && (
          <BudgetOverview
            plan={currentPlan}
            onUpdatePlan={handleUpdatePlan}
            isLoading={isBudgetLoading}
          />
        )}
      </main>
    </div>
  );
}
