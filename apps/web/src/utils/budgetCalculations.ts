import { EventPlan, BudgetItem } from "../api";

/**
 * Calculate total cost from all budget items
 */
export const calculateTotalCost = (items: BudgetItem[]): number => {
    return items.reduce((sum, item) => sum + item.cost, 0);
};

/**
 * Calculate remaining budget
 */
export const calculateRemainingBudget = (targetAmount: number, totalCost: number): number => {
    return targetAmount - totalCost;
};

/**
 * Calculate cost per person
 */
export const calculatePerPersonCost = (totalCost: number, guestCount: number): number => {
    if (guestCount === 0) return 0;
    return totalCost / guestCount;
};

/**
 * Calculate percentage of total for each budget item
 */
export const calculateBreakdownPercentages = (
    items: BudgetItem[]
): Array<BudgetItem & { percentage: number }> => {
    const total = calculateTotalCost(items);
    if (total === 0) return items.map((item) => ({ ...item, percentage: 0 }));

    return items.map((item) => ({
        ...item,
        percentage: (item.cost / total) * 100,
    }));
};

/**
 * Get budget status
 */
export const getBudgetStatus = (
    targetAmount: number,
    totalCost: number
): "within_budget" | "over_budget" | "no_budget" => {
    if (targetAmount === 0) return "no_budget";
    return totalCost <= targetAmount ? "within_budget" : "over_budget";
};

/**
 * Get all budget calculations for a plan
 */
export const getBudgetCalculations = (plan: EventPlan) => {
    // Ensure budget exists
    if (!plan.budget) {
        return {
            totalCost: 0,
            remainingBudget: 0,
            perPersonCost: 0,
            status: "no_budget" as const,
            itemsWithPercentages: [],
            guestCount: plan.eventMetadata.guestCount || 0,
            targetAmount: 0,
            currency: "AUD",
        };
    }

    const totalCost = calculateTotalCost(plan.budget.items);
    const remainingBudget = calculateRemainingBudget(plan.budget.targetAmount, totalCost);
    const guestCount = plan.eventMetadata.guestCount || 0;
    const perPersonCost = calculatePerPersonCost(totalCost, guestCount);
    const status = getBudgetStatus(plan.budget.targetAmount, totalCost);
    const itemsWithPercentages = calculateBreakdownPercentages(plan.budget.items);

    return {
        totalCost,
        remainingBudget,
        perPersonCost,
        status,
        itemsWithPercentages,
        guestCount,
        targetAmount: plan.budget.targetAmount,
        currency: plan.budget.currency,
    };
};

/**
 * Check if a message contains budget-related keywords
 */
export const isBudgetQuery = (message: string): boolean => {
    const budgetKeywords = [
        "budget",
        "cost",
        "price",
        "spend",
        "afford",
        "over budget",
        "per person",
        "cheaper",
        "reduce",
        "expensive",
        "save",
        "money",
    ];

    const lowerMessage = message.toLowerCase();
    return budgetKeywords.some((keyword) => lowerMessage.includes(keyword));
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = "AUD"): string => {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Get category color for budget items
 */
export const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        Venue: "#6a4a34",
        Catering: "#6b2a3a",
        Entertainment: "#4a5a6a",
        Decorations: "#5a4a6a",
        Photography: "#6a5a4a",
        Transportation: "#4a6a5a",
        Other: "#5a5a5a",
    };

    return colorMap[category] || "#5a5a5a";
};
