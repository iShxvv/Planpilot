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
    budget: BudgetData;
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

export interface BudgetData {
    targetAmount: number;
    currency: string;
    items: BudgetItem[];
}

export interface BudgetItem {
    id: string;
    category: string;
    name: string;
    cost: number;
    unitPrice?: number;
    quantity?: number;
    priceType: "fixed" | "per_person" | "per_hour" | "per_item";
    currency: string;
    status: "estimated" | "quoted" | "confirmed";
    source: "user" | "ai" | "serp_api";
    vendorId?: string;
    notes?: string;
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
    budget: {
        targetAmount: 10000,
        currency: "AUD",
        items: [],
    },
    aiContext: {
        conversationHistory: [],
        lastUserRequest: undefined,
        pendingActions: [],
    },
});

/**
 * Normalize plan structure to ensure all required fields exist
 * @param plan - Plan from n8n or storage
 * @returns Normalized plan with all required fields
 */
export const normalizePlan = (plan: any): EventPlan => {
    return {
        ...plan,
        attendees: Array.isArray(plan.attendees) ? plan.attendees : [],
        budget: plan.budget || {
            targetAmount: 10000,
            currency: "AUD",
            items: [],
        },
        schedule: Array.isArray(plan.schedule) ? plan.schedule : [],
        vendors: Array.isArray(plan.vendors) ? plan.vendors : [],
        notes: Array.isArray(plan.notes) ? plan.notes : [],
        aiContext: plan.aiContext || {
            conversationHistory: [],
            lastUserRequest: undefined,
            pendingActions: [],
        },
    };
};

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

        // Normalize the plan to ensure all required fields exist
        const normalizedPlan = normalizePlan(data.updatedPlan);

        return {
            updatedPlan: normalizedPlan,
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
            const plan = JSON.parse(stored);
            
            // Normalize the plan to ensure all required fields exist
            return normalizePlan(plan);
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

// ===== Budget Estimation API =====

export interface BudgetEstimateResponse {
    venue_cost_aud: number;
    catering_cost_aud: number;
    total_estimated_aud: number;
    budget_total_aud: number | null;
    difference_aud: number | null;
    status: "plausible" | "over_budget" | "no_budget";
    assumptions: string[];
}

/**
 * Fetch budget estimate from n8n workflow
 * @param plan - Current event plan
 * @param userMessage - The user's budget query message
 * @returns Budget estimate with venue and catering costs
 */
export const fetchBudgetEstimate = async (
    plan: EventPlan,
    userMessage: string = "What's my budget?"
): Promise<BudgetEstimateResponse> => {
    try {
        const N8N_BUDGET_WEBHOOK = import.meta.env.VITE_N8N_BUDGET_WEBHOOK_URL || 
            "https://shxvv.app.n8n.cloud/webhook/adcf1994-1aa7-4df9-af86-7afe7dc05459";

        console.log("Fetching budget estimate from n8n:", N8N_BUDGET_WEBHOOK);
        
        // Transform plan to match n8n expected format
        // n8n expects: plan.eventMetadata.budget.total
        // We have: plan.budget.targetAmount
        const transformedPlan = {
            ...plan,
            eventMetadata: {
                ...plan.eventMetadata,
                budget: {
                    total: plan.budget.targetAmount || null
                }
            }
        };
        
        console.log("Sending transformed plan:", transformedPlan);
        console.log("User message:", userMessage);

        const response = await fetch(N8N_BUDGET_WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                user_message: userMessage,
                plan: transformedPlan 
            }),
        });

        if (!response.ok) {
            throw new Error(`Budget API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Budget estimate response:", data);

        return data;
    } catch (error: any) {
        console.error("Error fetching budget estimate:", error);
        throw error;
    }
};

/**
 * Merge budget estimate response into EventPlan
 * @param plan - Current event plan
 * @param estimate - Budget estimate from n8n
 * @returns Updated event plan with budget items
 */
export const mergeBudgetEstimate = (
    plan: EventPlan,
    estimate: BudgetEstimateResponse
): EventPlan => {
    const updatedItems = [...plan.budget.items];

    // Check if venue is already confirmed by user
    const confirmedVenue = plan.vendors.find(
        (v) =>
            v.category.toLowerCase() === "venue" &&
            v.cost &&
            (v.status === "booked" || v.status === "confirmed")
    );

    // Update or create venue budget item
    const venueItemIndex = updatedItems.findIndex((item) => item.id === "auto-venue");
    const venueItem: BudgetItem = {
        id: "auto-venue",
        category: "Venue",
        name: confirmedVenue?.name || "Venue (Estimated)",
        cost: confirmedVenue?.cost || estimate.venue_cost_aud,
        unitPrice: confirmedVenue?.cost || estimate.venue_cost_aud,
        quantity: 1,
        priceType: "fixed",
        currency: "AUD",
        status: confirmedVenue ? "confirmed" : "estimated",
        source: confirmedVenue ? "user" : "serp_api",
        vendorId: confirmedVenue?.id,
        notes: confirmedVenue ? undefined : "Estimated from market research",
    };

    if (venueItemIndex >= 0) {
        updatedItems[venueItemIndex] = venueItem;
    } else {
        updatedItems.push(venueItem);
    }

    // Update or create catering budget item
    const cateringItemIndex = updatedItems.findIndex((item) => item.id === "auto-catering");
    const guestCount = plan.eventMetadata.guestCount || 50;
    const cateringUnitPrice = estimate.catering_cost_aud / guestCount;

    const cateringItem: BudgetItem = {
        id: "auto-catering",
        category: "Catering",
        name: "Catering (Estimated)",
        cost: estimate.catering_cost_aud,
        unitPrice: cateringUnitPrice,
        quantity: guestCount,
        priceType: "per_person",
        currency: "AUD",
        status: "estimated",
        source: "serp_api",
        notes: "Estimated from market research",
    };

    if (cateringItemIndex >= 0) {
        updatedItems[cateringItemIndex] = cateringItem;
    } else {
        updatedItems.push(cateringItem);
    }

    return {
        ...plan,
        budget: {
            ...plan.budget,
            items: updatedItems,
        },
    };
};