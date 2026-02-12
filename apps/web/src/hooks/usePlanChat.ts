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

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      console.log("Current Plan State before send:", currentPlan);

      // Check if this is a budget-related query
      const isBudgetRelated = isBudgetQuery(message);

      if (isBudgetRelated) {
        // Fetch budget estimate from n8n
        try {
          const budgetEstimate = await fetchBudgetEstimate(
            currentPlan,
            message
          );

          const updatedPlan = mergeBudgetEstimate(currentPlan, budgetEstimate);
          onUpdatePlan(updatedPlan);

          // Create a summary response
          const summaryResponse =
            `I've researched costs for your event:\n\n` +
            `• Venue: ${formatCurrency(
              budgetEstimate.venue_cost_aud,
              "AUD"
            )}\n` +
            `• Catering: ${formatCurrency(
              budgetEstimate.catering_cost_aud,
              "AUD"
            )}\n` +
            `• Total Estimated: ${formatCurrency(
              budgetEstimate.total_estimated_aud,
              "AUD"
            )}\n\n` +
            `Status: ${
              budgetEstimate.status === "plausible"
                ? "Within budget"
                : budgetEstimate.status === "over_budget"
                ? "Over budget"
                : "No budget set"
            }\n\n` +
            `Assumptions:\n${budgetEstimate.assumptions
              .map((a) => `• ${a}`)
              .join("\n")}`;

          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: summaryResponse },
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
        }
      } else {
        // Regular chat message
        const response = await sendPlanMessage(message, currentPlan);
        onUpdatePlan(response.updatedPlan);
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
    sendMessage,
    setChatMessages,
    addLogMessage,
  };
}
