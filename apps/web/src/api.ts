// n8n Event Planner API
const N8N_WEBHOOK_URL = "https://irfanul.app.n8n.cloud/webhook/e0b34cea-33da-4f34-8c16-d77330ddb470";

// Response types
export interface ResearchItem {
    type: string;
    name: string;
    description: string;
    cost: string;
    image_url?: string;
    link?: string;
}

export interface ScheduleItem {
    time: string;
    activity: string;
    notes?: string;
}

export interface EventState {
    type?: string;
    date?: string;
    guests?: number;
    location?: string;
    budget?: string;
}

export interface EventPlannerResponse {
    user_reply: string;
    ui_type: "research_list" | "schedule_view" | null;
    data?: {
        title?: string;
        items?: ResearchItem[] | ScheduleItem[];
        event_state?: EventState;
    } | null;
}

/**
 * Send a message to the n8n Event Planner AI
 * @param message - The user's message/query
 * @returns Structured response from the AI
 */
export const sendEventMessage = async (message: string): Promise<EventPlannerResponse> => {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Error calling n8n webhook:", error);
        // Return a fallback error response
        return {
            user_reply: "Sorry, I'm having trouble connecting right now. Please try again.",
            ui_type: null,
            data: null,
        };
    }
};