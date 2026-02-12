import { useRef, useEffect } from "react";
import styles from "../pages/PlanPage.module.css";
import { EventPlan, ScheduleItem, Candidate, DecisionModule, BudgetItem } from "../api";

interface PlanOverviewProps {
  plan: EventPlan;
  onUpdatePlan: (plan: EventPlan) => void;
  onSendAction: (action: string) => void;
  isLoading?: boolean;
}

// Helper for auto-resizing textarea
const AutoResizeTextArea = ({ value, onChange, className, placeholder }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea ref={textareaRef} className={className} value={value} onChange={onChange} placeholder={placeholder} rows={1} />
  );
};

export default function PlanOverview({
  plan,
  onUpdatePlan,
  onSendAction,
  isLoading,
}: PlanOverviewProps) {
  
  // --- Quick Edit Handlers ---
  const updateMetadata = (field: string, value: any) => {
    onUpdatePlan({
      ...plan,
      eventMetadata: { ...plan.eventMetadata, [field]: value },
    });
  };

  const updateLocation = (field: string, value: any) => {
      onUpdatePlan({
          ...plan,
          eventMetadata: {
              ...plan.eventMetadata,
              location: { ...plan.eventMetadata.location, [field]: value }
          }
      });
  }

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...plan.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    onUpdatePlan({ ...plan, schedule: newSchedule });
  };

  const addScheduleItem = () => {
      const newSchedule = [...plan.schedule, { id: `sch-${Date.now()}`, time: "00:00", activity: "New Activity", notes: "" }];
      onUpdatePlan({ ...plan, schedule: newSchedule });
  };

  const deleteScheduleItem = (index: number) => {
      onUpdatePlan({ ...plan, schedule: plan.schedule.filter((_, i) => i !== index) });
  }

  // --- Module Handlers ---
  /* --- Module Handler with Budget Sync --- */
  const handleSelectCandidate = (moduleKey: string, candidate: Candidate) => {
      // 1. Update Module Status
      const updatedModules = { ...plan.modules };
      updatedModules[moduleKey] = {
          ...updatedModules[moduleKey],
          status: 'booked',
          selectedChoice: candidate
      };
      
      // 2. Sync with Budget
      // Filter out any existing item for this exact module to avoid duplicates
      const currentItems = plan.budget?.items || [];
      const otherItems = currentItems.filter(item => 
          item.id !== `budget-${moduleKey}` && // Check ID convention
          item.category.toLowerCase() !== updatedModules[moduleKey].type.toLowerCase() // Check category fallback
      );

      const newBudgetItem: BudgetItem = {
          id: `budget-${moduleKey}`, // Stable ID linked to module
          category: updatedModules[moduleKey].type.charAt(0).toUpperCase() + updatedModules[moduleKey].type.slice(1),
          name: candidate.name,
          cost: candidate.priceEstimate,
          unitPrice: candidate.priceEstimate,
          quantity: 1,
          priceType: 'fixed',
          status: 'confirmed',
          source: 'user',
          currency: candidate.currency || plan.budget?.currency || 'AUD'
      };

      const updatedBudget = {
          ...plan.budget,
          items: [...otherItems, newBudgetItem]
      };

      // 3. Save Everything
      onUpdatePlan({ 
          ...plan, 
          modules: updatedModules,
          budget: updatedBudget 
      });
  };

  const handleResetModule = (moduleKey: string) => {
      const updatedModules = { ...plan.modules };
      updatedModules[moduleKey] = {
          ...updatedModules[moduleKey],
          status: 'review', // Go back to review to see options
          selectedChoice: null,
          // candidates: [] // DO NOT CLEAR CANDIDATES
      };
      onUpdatePlan({ ...plan, modules: updatedModules });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Drafting your plan...</p>
      </div>
    );
  }

  return (
    <div className={styles.commandCenter}>
      
      {/* 1. HERO SECTION */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <input
            className={styles.heroTitleInput}
            value={plan.eventMetadata.title || ""}
            onChange={(e) => updateMetadata("title", e.target.value)}
            placeholder="Event Name"
          />
          <AutoResizeTextArea
            className={styles.heroDescInput}
            value={plan.eventMetadata.description || ""}
            onChange={(e: any) => updateMetadata("description", e.target.value)}
            placeholder="Describe the vibe, goals, and vision..."
          />
          
          <div className={styles.heroStatsRow}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>DATE</span>
              <input 
                type="date"
                className={styles.statInput}
                value={plan.eventMetadata.date || ""}
                onChange={(e) => updateMetadata("date", e.target.value)}
              />
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>GUESTS</span>
              <input 
                type="number"
                className={styles.statInput}
                style={{ width: '60px' }}
                value={plan.eventMetadata.guestCount || ""}
                onChange={(e) => updateMetadata("guestCount", parseInt(e.target.value))}
              />
            </div>
             <div className={styles.statPill}>
              <span className={styles.statLabel}>LOCATION</span>
              <input 
                className={styles.statInput}
                value={plan.eventMetadata.location?.city || ""}
                onChange={(e) => updateLocation("city", e.target.value)}
                placeholder="City"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        
        {/* 2. LEFT COL: RUN SHEET */}
        <div className={styles.timelineColumn}>
          <div className={styles.columnHeader}>
            <h3>Run Sheet</h3>
            <button className={styles.iconBtn} onClick={addScheduleItem}>+</button>
          </div>
          
          <div className={styles.timelineContainer}>
            {plan.schedule.map((item, idx) => (
              <div key={idx} className={styles.timelineRow}>
                <div className={styles.timeWrapper}>
                  <input
                    className={styles.timeInput}
                    value={item.time}
                    onChange={(e) => updateScheduleItem(idx, "time", e.target.value)}
                    placeholder="Time"
                  />
                </div>
                <div className={styles.timelineContent}>
                  <input
                    className={styles.activityInput}
                    value={item.activity}
                    onChange={(e) => updateScheduleItem(idx, "activity", e.target.value)}
                    placeholder="Activity Name"
                  />
                  <input
                    className={styles.notesInput}
                    value={item.notes || ""}
                    onChange={(e) => updateScheduleItem(idx, "notes", e.target.value)}
                    placeholder="Notes..."
                  />
                </div>
                <button className={styles.deleteBtn} onClick={() => deleteScheduleItem(idx)}>×</button>
              </div>
            ))}
            {plan.schedule.length === 0 && (
                <div className={styles.emptyStateSimple} onClick={addScheduleItem}>
                    + Add Time Slot
                </div>
            )}
          </div>
        </div>

        {/* 3. RIGHT COL: DECISION MODULES */}
        <div className={styles.logisticsColumn}>
            <div className={styles.columnHeader}>
                <h3>Services</h3>
            </div>
            
            <div className={styles.vendorsList}>
                {plan.modules && Object.entries(plan.modules).map(([key, mod]) => {
                    const module = mod as DecisionModule;
                    // Visual State: IDLE / SCOUTING
                    if (module.status === 'idle' || module.status === 'scouting') {
                         return (
                            <div key={key} className={styles.logisticsCard}>
                                <div className={styles.cardTopRow}>
                                    <span className={styles.categoryTag}>{module.type}</span>
                                    {module.status === 'scouting' && <span className={styles.costTag}>Scouting...</span>}
                                </div>
                                <div className={styles.researchState}>
                                    <div className={styles.tbdLabel}>
                                        {module.status === 'scouting' ? "AI is researching..." : "Not Details Yet"}
                                    </div>
                                    <button 
                                        className={styles.actionBtn}
                                        onClick={() => onSendAction(`Find me options for ${module.type} in ${plan.eventMetadata.location?.city}`)}
                                    >
                                        {module.status === 'scouting' ? "Retry Search" : "Find Options"}
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    // Visual State: REVIEW (Success from AI)
                    if (module.status === 'review') {
                        const hasCandidates = module.candidates && module.candidates.length > 0;
                        return (
                             <div key={key} className={styles.logisticsCard}>
                                <div className={styles.cardTopRow}>
                                    <span className={styles.categoryTag}>{module.type}</span>
                                    <span className={styles.costTag}>
                                        {hasCandidates ? `${module.candidates.length} Options Found` : "No Options Found"}
                                    </span>
                                </div>
                                <div className={styles.suggestionsDrawer} style={{marginTop: 0, padding: 0, background: 'transparent'}}>
                                    {hasCandidates ? (
                                        module.candidates.map((cand: any, cIdx: number) => (
                                            <div key={cIdx} className={styles.richCandidate} onClick={() => handleSelectCandidate(key, cand)}>
                                                {cand.imageUrl && cand.imageUrl.startsWith("http") && (
                                                    <img src={cand.imageUrl} alt={cand.name} className={styles.richImage} loading="lazy" />
                                                )}
                                                <div className={styles.richContent}>
                                                    <div className={styles.richHeader}>
                                                        <div className={styles.richName}>{cand.name}</div>
                                                        <div className={styles.richPrice}>{cand.currency || "$"}{cand.priceEstimate}</div>
                                                    </div>
                                                    <div className={styles.richDesc}>{cand.description}</div>
                                                    <div className={styles.richSelectBtn}>Select Option</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.researchState}>
                                            <div className={styles.tbdLabel}>Could not find matches.</div>
                                            <button 
                                                className={styles.actionBtn}
                                                onClick={() => onSendAction(`Find better options for ${module.type}`)}
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    // Visual State: BOOKED (Locked in)
                    if (module.status === 'booked' && module.selectedChoice) {
                        return (
                            <div key={key} className={styles.logisticsCard} style={{borderColor: 'rgba(76, 175, 80, 0.5)', background: 'rgba(76, 175, 80, 0.05)'}}>
                                <div className={styles.cardTopRow}>
                                    <span className={styles.categoryTag} style={{color: '#81c784', background: 'rgba(76, 175, 80, 0.1)'}}>{module.type}</span>
                                    <span className={styles.costTag} style={{color: '#81c784'}}>LOCKED</span>
                                </div>
                                <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                                    {module.selectedChoice.imageUrl && module.selectedChoice.imageUrl.startsWith("http") && (
                                        <img 
                                            src={module.selectedChoice.imageUrl} 
                                            alt={module.selectedChoice.name} 
                                            style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)'}} 
                                        />
                                    )}
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div className={styles.vendorNameLarge} style={{marginTop: 0, fontSize: '16px'}}>{module.selectedChoice.name}</div>
                                        <div className={styles.vendorDesc} style={{marginBottom: '8px', fontSize: '12px'}}>{module.selectedChoice.description}</div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div className={styles.costTag} style={{color: '#81c784'}}>{module.selectedChoice.currency} {module.selectedChoice.priceEstimate}</div>
                                            <div 
                                                style={{fontSize: '11px', color: '#aaa', cursor: 'pointer', textDecoration: 'underline'}}
                                                onClick={() => handleResetModule(key)}
                                            >
                                                Change
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>

      </div>
    </div>
  );
}
