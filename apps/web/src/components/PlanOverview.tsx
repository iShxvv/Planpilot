import styles from "../pages/PlanPage.module.css";
import { EventPlan } from "../api";

interface PlanOverviewProps {
  plan: EventPlan;
}

export default function PlanOverview({ plan }: PlanOverviewProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>Event Overview</div>
      <div className={styles.planContent}>
        {plan.eventMetadata.title ? (
          <>
            <div className={styles.metadataCard}>
              <h2 className={styles.eventTitle}>{plan.eventMetadata.title}</h2>
              {plan.eventMetadata.description && (
                <p className={styles.muted}>{plan.eventMetadata.description}</p>
              )}
              <div className={styles.metadataGrid}>
                {plan.eventMetadata.date && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Date</span>
                    <span className={styles.metadataValue}>
                      {plan.eventMetadata.date}
                    </span>
                  </div>
                )}
                {plan.eventMetadata.location?.city && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Location</span>
                    <span className={styles.metadataValue}>
                      {plan.eventMetadata.location.venue ||
                        plan.eventMetadata.location.city}
                    </span>
                  </div>
                )}
                {plan.eventMetadata.guestCount && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Guests</span>
                    <span className={styles.metadataValue}>
                      {plan.eventMetadata.guestCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {plan.schedule.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Schedule</h3>
                {plan.schedule.map((item, idx) => (
                  <div key={item.id || idx} className={styles.scheduleCard}>
                    <div className={styles.scheduleTime}>{item.time}</div>
                    <div className={styles.scheduleDetails}>
                      <div className={styles.scheduleActivity}>
                        {item.activity}
                      </div>
                      {item.location && (
                        <div className={styles.scheduleLocation}>
                          {item.location}
                        </div>
                      )}
                      {item.notes && (
                        <div className={styles.muted}>{item.notes}</div>
                      )}
                    </div>
                    {item.status && (
                      <div
                        className={`${styles.statusBadge} ${
                          styles[`status-${item.status}`]
                        }`}
                      >
                        {item.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {plan.vendors.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Vendors</h3>
                {plan.vendors.map((vendor, idx) => (
                  <div key={vendor.id || idx} className={styles.vendorCard}>
                    <div className={styles.vendorHeader}>
                      <div>
                        <div className={styles.vendorCategory}>
                          {vendor.category}
                        </div>
                        <div className={styles.vendorName}>
                          {vendor.name || "Researching..."}
                        </div>
                      </div>
                      <div
                        className={`${styles.statusBadge} ${
                          styles[`status-${vendor.status}`]
                        }`}
                      >
                        {vendor.status}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className={styles.muted}>{vendor.description}</p>
                    )}
                    {vendor.cost && (
                      <div className={styles.vendorCost}>
                        {vendor.currency} {vendor.cost.toLocaleString()}
                      </div>
                    )}
                    {vendor.researchSuggestions &&
                      vendor.researchSuggestions.length > 0 && (
                        <div className={styles.researchSection}>
                          <div className={styles.researchTitle}>
                            Suggestions:
                          </div>
                          {vendor.researchSuggestions.map((suggestion, idx) => (
                            <div key={idx} className={styles.suggestionCard}>
                              <div className={styles.suggestionName}>
                                {suggestion.name}
                              </div>
                              <div className={styles.suggestionDescription}>
                                {suggestion.description}
                              </div>
                              {suggestion.estimatedCost && (
                                <div className={styles.suggestionCost}>
                                  ~{suggestion.currency}{" "}
                                  {suggestion.estimatedCost.toLocaleString()}
                                </div>
                              )}
                              {suggestion.reasoning && (
                                <div className={styles.suggestionReasoning}>
                                  {suggestion.reasoning}
                                </div>
                              )}
                              {suggestion.link && (
                                <a
                                  href={suggestion.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.suggestionLink}
                                >
                                  View Details →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2>Start Planning Your Event</h2>
            <p>Chat with the AI to create your event plan</p>
          </div>
        )}
      </div>
    </section>
  );
}
