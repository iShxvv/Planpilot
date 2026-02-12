// n8n Event Planner AI - Plan-based Architecture
const N8N_WEBHOOK_URL = "https://irfanul.app.n8n.cloud/webhook/event-planner";

// ===== Core Plan Types =====

export interface EventPlan {
    planId: string | null;
    version: number;
    lastUpdated: string | null;
    eventMetadata: EventMetadata;
    schedule: ScheduleItem[];
    vendors: VendorItem[];
    attendees: AttendeeItem[];
    notes: NoteItem[];
    aiContext: AIContext;
}

export interface EventMetadata {
    type?: string;
    title?: string;
    description?: string;
    date?: string;
    timeStart?: string;
    timeEnd?: string;
    location?: {
        venue?: string;
        address?: string;
        city?: string;
        region?: string;
        country?: string;
    };
    guestCount?: number;

    status?: "draft" | "planning" | "confirmed" | "completed";
}

export interface ScheduleItem {
    id: string;
    time: string;
    duration?: number;
    activity: string;
    location?: string;
    notes?: string;
    status?: "pending" | "planning" | "confirmed";
}

export interface ResearchSuggestion {
    name: string;
    description: string;
    estimatedCost?: number;
    currency?: string;
    link?: string;
    imageUrl?: string;
    rating?: number;
    reasoning?: string;
}

export interface VendorItem {
    id: string;
    category: string;
    name: string | null;
    description?: string;
    contact?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    cost?: number;
    currency?: string;
    status: "researching" | "contacted" | "quoted" | "booked" | "confirmed";
    notes?: string;
    imageUrl?: string;
    bookedDate?: string;
    researchSuggestions?: ResearchSuggestion[];
}

export interface AttendeeItem {
    id: string;
    name: string;
    email: string;
    role?: "guest" | "vip" | "speaker" | "organizer";
    rsvpStatus?: "invited" | "confirmed" | "declined" | "maybe";
    dietary?: string;
    plusOne?: boolean;
}






export interface NoteItem {
    id: string;
    content: string;
    category?: string;
    createdAt: string;
    createdBy: "ai" | "user";
}

export interface AIContext {
    conversationHistory: Array<{
        role: "user" | "assistant";
        content: string;
        timestamp?: string;
    }>;
    lastUserRequest?: string;
    pendingActions?: string[];
}

// ===== API Response =====

export interface EventPlannerResponse {
    updatedPlan: EventPlan;
    userReply: string;
}

// ===== Empty Plan Template =====

export const createEmptyPlan = (): EventPlan => ({
    planId: null,
    version: 0,
    lastUpdated: null,
    eventMetadata: {},
    schedule: [],
    vendors: [],
    attendees: [],
    notes: [],
    aiContext: {
        conversationHistory: [],
        lastUserRequest: undefined,
        pendingActions: [],
    },
});

// ===== API Functions =====

/**
 * Send a message to the AI Agent with the current plan
 * @param userMessage - The user's message/query
 * @param currentPlan - The current event plan (or empty plan)
 * @returns Updated plan and AI's conversational response
 */
export const sendPlanMessage = async (
    userMessage: string,
    currentPlan: EventPlan | null = null
): Promise<EventPlannerResponse> => {
    try {
        const planToSend = currentPlan || createEmptyPlan();

        console.log("Sending to n8n:", { userMessage, planToSend });

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userMessage,
                currentPlan: planToSend,
                currentDate: new Date().toISOString(),
            }),
        });

        console.log("n8n response status:", response.status);

        if (!response.ok) {
            console.error("n8n returned error status:", response.status);
            throw new Error(`API error: ${response.status}`);
        }

        // Get raw text first to see what we're getting
        const rawText = await response.text();
        console.log("Raw response from n8n:", rawText);

        // Try to parse it
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("Failed to parse n8n response as JSON:", parseError);
            console.error("Raw response was:", rawText);
            throw new Error("n8n returned invalid JSON");
        }

        console.log("Parsed data:", data);

        // Validate the response structure
        if (!data.updatedPlan || !data.userReply) {
            console.error("n8n response missing required fields:", data);
            throw new Error("Invalid response format from n8n");
        }

        return {
            updatedPlan: data.updatedPlan,
            userReply: data.userReply,
        };
    } catch (error: any) {
        console.error("Error calling n8n webhook:", error);
        // Return a fallback error response
        return {
            updatedPlan: currentPlan || createEmptyPlan(),
            userReply: `Error: ${error.message}. Please check your n8n workflow is running and returning the correct format.`,
        };
    }
};

// ===== Local Storage Helpers =====

const STORAGE_KEY = "planpilot_current_plan";

export const savePlanToStorage = (plan: EventPlan): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch (error) {
        console.error("Error saving plan to localStorage:", error);
    }
};

export const loadPlanFromStorage = (): EventPlan | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Error loading plan from localStorage:", error);
    }
    return null;
};

export const clearPlanFromStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Error clearing plan from localStorage:", error);
    }
};