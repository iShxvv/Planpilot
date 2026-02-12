import { useState } from "react";
import styles from "./BudgetTrackerDashboard.module.css";
import { EventPlan } from "../api";
import { getBudgetCalculations, formatCurrency, getCategoryColor } from "../utils/budgetCalculations";

interface BudgetTrackerDashboardProps {
  currentPlan: EventPlan;
  onUpdateTarget: (newTarget: number) => void;
}

function MiniIcon({ kind }: { kind: "edit" | "coin" | "mail" | "user" }) {
  switch (kind) {
    case "edit":
      return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
          <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25z" />
          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
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

export default function BudgetTrackerDashboard({ currentPlan, onUpdateTarget }: BudgetTrackerDashboardProps) {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Calculate all budget values dynamically
  const calculations = getBudgetCalculations(currentPlan);
  const {
    totalCost,
    remainingBudget,
    perPersonCost,
    status,
    itemsWithPercentages,
    guestCount,
    targetAmount,
    currency,
  } = calculations;

  const isWithinBudget = status === "within_budget";
  const hasNoBudget = status === "no_budget";

  // Get confirmed attendees count (fallback to guestCount)
  const confirmedAttendees = currentPlan.attendees.filter(
    (a) => a.rsvpStatus === "confirmed"
  ).length || guestCount;

  return (
    <div className={styles.dashboard}>
      {/* Top Row - 2 Cards */}
      <div className={styles.topRow}>
        {/* Your Target Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Your Target</span>
            <button 
              className={styles.editBtn}
              onClick={() => {
                setIsEditingTarget(true);
                setInputValue(targetAmount.toString());
              }}
              aria-label="Edit target"
            >
              <MiniIcon kind="edit" />
            </button>
          </div>
          {isEditingTarget ? (
            <input
              type="text"
              className={styles.targetInput}
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setInputValue(value);
              }}
              onBlur={() => {
                const numValue = Number(inputValue) || 0;
                onUpdateTarget(numValue);
                setIsEditingTarget(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const numValue = Number(inputValue) || 0;
                  onUpdateTarget(numValue);
                  setIsEditingTarget(false);
                }
              }}
              autoFocus
              placeholder="Enter amount"
            />
          ) : (
            <div className={styles.targetAmount}>{formatCurrency(targetAmount, currency)}</div>
          )}
        </div>

        {/* Event Total Cost Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Event Total Cost</div>
          <div className={styles.totalCost}>{formatCurrency(totalCost, currency)}</div>
          <div className={styles.budgetStatus}>
            {hasNoBudget ? (
              <div className={styles.statusText}>Set a budget target to track spending</div>
            ) : isWithinBudget ? (
              <>
                <div className={styles.statusText}>Your event is within your budget</div>
                <div className={styles.statusText}>
                  You have {formatCurrency(Math.abs(remainingBudget), currency)} to spend
                </div>
              </>
            ) : (
              <>
                <div className={styles.statusText}>Your event is over budget</div>
                <div className={styles.statusText}>
                  You are {formatCurrency(Math.abs(remainingBudget), currency)} over budget
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row - Budget Breakdown */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Budget Breakdown</div>
        {itemsWithPercentages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#999', marginBottom: '8px' }}>No budget items yet</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Ask the AI to research costs for your event</p>
          </div>
        ) : (
          <div className={styles.breakdownContent}>
            <div className={styles.pieChart}>
              <svg viewBox="0 0 200 200" className={styles.pieSvg}>
                {itemsWithPercentages.map((item, idx) => {
                  const percentage = item.percentage;
                  const previousPercentages = itemsWithPercentages
                    .slice(0, idx)
                    .reduce((sum, prev) => sum + prev.percentage, 0);
                  
                  const startAngle = (previousPercentages / 100) * 360;
                  const endAngle = startAngle + (percentage / 100) * 360;
                  
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  
                  const x1 = 100 + 80 * Math.cos(startRad);
                  const y1 = 100 + 80 * Math.sin(startRad);
                  const x2 = 100 + 80 * Math.cos(endRad);
                  const y2 = 100 + 80 * Math.sin(endRad);
                  
                  const largeArc = percentage > 50 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  return (
                    <path
                      key={item.id}
                      d={pathData}
                      fill={getCategoryColor(item.category)}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
            <div className={styles.breakdownList}>
              {itemsWithPercentages.map((item) => {
                const percentage = item.percentage.toFixed(0);
                let displayText = "";
                
                if (item.priceType === "per_person" && item.unitPrice && item.quantity) {
                  displayText = `${item.name} • ${percentage}% • ${formatCurrency(item.unitPrice, currency)} x ${item.quantity} people = ${formatCurrency(item.cost, currency)}`;
                } else {
                  displayText = `${item.name} • ${percentage}% • ${formatCurrency(item.cost, currency)}`;
                }
                
                return (
                  <div key={item.id} className={styles.breakdownItem}>
                    <span className={styles.breakdownDot} style={{ color: getCategoryColor(item.category) }}>●</span>
                    <span className={styles.breakdownText}>
                      {displayText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row - 2 Cards */}
      <div className={styles.bottomRow}>
        {/* Email Responses Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MiniIcon kind="mail" />
            <span className={styles.cardTitle}>Email Responses</span>
          </div>
          <div className={styles.statNumber}>{confirmedAttendees}</div>
          <div className={styles.statLabel}>Confirmed Attendees</div>
        </div>

        {/* Price Per Person Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MiniIcon kind="user" />
            <span className={styles.cardTitle}>Price Per Person</span>
          </div>
          <div className={styles.statNumber}>
            {confirmedAttendees > 0 ? formatCurrency(perPersonCost, currency) : formatCurrency(0, currency)}
          </div>
          <div className={styles.statLabel}>Per Attendee</div>
        </div>
      </div>
    </div>
  );
}
