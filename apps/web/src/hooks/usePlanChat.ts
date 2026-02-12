import { useState } from "react";
import {
  EventPlan,
  sendPlanMessage,
  fetchBudgetEstimate,
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
        // Budget query: Update plan first, then fetch budget
        try {
          setIsBudgetLoading(true);
          
          // Get plan update from event planner
          const response = await sendPlanMessage(message, currentPlan);
          let updatedPlan = response.updatedPlan;

          // Then fetch budget estimate
          console.log("=== CALLING BUDGET WEBHOOK ===");
          const budgetEstimate = await fetchBudgetEstimate(updatedPlan, message);

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
            `Status: ${
              budgetEstimate.status === "plausible"
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
        onUpdatePlan(updatedPlan);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.userReply },
        ]);

        // Fetch budget estimate in background (don't block the UI)
        // Only if we have enough info (guestCount or event type)
        if (updatedPlan.eventMetadata.guestCount || updatedPlan.eventMetadata.type) {
          console.log("=== FETCHING BACKGROUND BUDGET ===");
          setIsBudgetLoading(true);
          fetchBudgetEstimate(updatedPlan, "Estimate costs for this event")
            .then((budgetEstimate) => {
              console.log("Background budget estimate:", budgetEstimate);
              const planWithBudget = mergeBudgetEstimate(updatedPlan, budgetEstimate);
              onUpdatePlan(planWithBudget);
            })
            .catch((err) => {
              console.log("Background budget fetch failed (non-critical):", err);
            })
            .finally(() => {
              setIsBudgetLoading(false);
            });
        }
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
