import { useState } from "react";
import {
  EventPlan,
  sendPlanMessage,
  calculateBudgetEstimate,
  mergeBudgetEstimate,
} from "../api";
import { isBudgetQuery, formatCurrency } from "../utils/budgetCalculations";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function usePlanChat(
  currentPlan: EventPlan,
  onUpdatePlan: (plan: EventPlan) => void
) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      console.log("Current Plan State before send:", currentPlan);

      // Check if this is a budget-related query
      const isBudgetRelated = isBudgetQuery(message);

      if (isBudgetRelated) {
        // Budget query: Update plan first, then calculate budget
        try {
          setIsBudgetLoading(true);

          // Get plan update from event planner
          const response = await sendPlanMessage(message, currentPlan);
          let updatedPlan = response.updatedPlan;

          // Then calculate budget estimate locally
          console.log("=== CALCULATING BUDGET ESTIMATE ===");
          const budgetEstimate = calculateBudgetEstimate(updatedPlan);

          console.log("=== BUDGET ESTIMATE RESPONSE ===");
          console.log("Budget estimate:", budgetEstimate);

          // Merge budget into the updated plan
          updatedPlan = mergeBudgetEstimate(updatedPlan, budgetEstimate);
          onUpdatePlan(updatedPlan);

          // Create a combined response
          const budgetSummary =
            `\n\n💰 Budget Update:\n` +
            `• Venue: ${formatCurrency(budgetEstimate.venue_cost_aud, "AUD")}\n` +
            `• Catering: ${formatCurrency(budgetEstimate.catering_cost_aud, "AUD")}\n` +
            `• Total Estimated: ${formatCurrency(budgetEstimate.total_estimated_aud, "AUD")}\n` +
            `Status: ${budgetEstimate.status === "plausible"
              ? "Within budget ✓"
              : budgetEstimate.status === "over_budget"
                ? "Over budget ⚠️"
                : "No budget set"
            }`;

          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.userReply + budgetSummary },
          ]);
        } catch (budgetError) {
          console.error("Budget estimate error:", budgetError);
          // Fall back to regular chat if budget API fails
          const response = await sendPlanMessage(message, currentPlan);
          onUpdatePlan(response.updatedPlan);
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.userReply },
          ]);
        } finally {
          setIsBudgetLoading(false);
        }
      } else {
        // Regular chat message: Update plan and fetch budget in background
        const response = await sendPlanMessage(message, currentPlan);
        let updatedPlan = response.updatedPlan;

        // --- INSTANT BUDGET UPDATE ---
        // Calculate budget locally based on the new plan state
        // Only if we have enough info (guestCount or event type)
        if (updatedPlan.eventMetadata.guestCount || updatedPlan.eventMetadata.type) {
          console.log("=== CALCULATING BUDGET ===");
          const budgetEstimate = calculateBudgetEstimate(updatedPlan);
          console.log("Budget estimate:", budgetEstimate);

          // Merge budget into the plan
          updatedPlan = mergeBudgetEstimate(updatedPlan, budgetEstimate);
        }

        onUpdatePlan(updatedPlan);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.userReply },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addLogMessage = (message: string) => {
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", content: message },
    ]);
  };

  return {
    chatMessages,
    isLoading,
    isBudgetLoading,
    sendMessage,
    setChatMessages,
    addLogMessage,
  };
}
