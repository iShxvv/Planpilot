import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FormComponents.module.css";


const FormBox = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    eventType: "",
    eventDateRange: "",
    eventLocation: "",
    numberOfAttendees: "",
    budget: "",
  });

  const navigate = useNavigate();

  const updateForm = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    // Go to loading step
    setLoading(true);

    // Simulate contacting backend
    setTimeout(() => {
      setSubmittedData(formData); 
      setLoading(false);
      setStep(step + 1); 
    }, 2000); 
  };

  if (loading) {
    return (
      <div className={styles.box}>
        <h2>Submitting your event...</h2>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (submittedData) {
    return (
      <div className={styles.box}>
        <h2>Event Submitted</h2>
        Fetch response from Backend and display here
        <button className={styles.button} 
        onClick={() => navigate("/plan")}>Start Plan</button>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      {step === 1 && (
        <>
          <h2>What kind of event would you like to create?</h2>
          <input
            type="text"
            placeholder="I'd like to create: A wedding for my spouse and I"
            value={formData.eventType}
            onChange={(e) => updateForm({ eventType: e.target.value })}
          />
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => setStep(2)}>Next</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Approximately when would you like to have your event?</h2>
          <input
            type="text"
            placeholder="I'd like to have my event on the:"
            value={formData.eventDateRange}
            onChange={(e) => updateForm({ eventDateRange: e.target.value })}
          />
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => setStep(1)}>Back</button>
            <button className={styles.button} onClick={() => setStep(3)}>Next</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Where would you like to have your event?</h2>
          <input
            type="text"
            placeholder="Central Melbourne..."
            value={formData.eventLocation}
            onChange={(e) => updateForm({ eventLocation: e.target.value })}
          />
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => setStep(2)}>Back</button>
            <button className={styles.button} onClick={() => setStep(4)}>Next</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2>How many people are attending this event?</h2>
          <input
            type="text"
            placeholder="..."
            value={formData.numberOfAttendees}
            onChange={(e) => updateForm({ numberOfAttendees: e.target.value })}
          />
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => setStep(3)}>Back</button>
            <button className={styles.button} onClick={() => setStep(5)}>Next</button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h2>Do you have a maximum budget for this event?</h2>
          <input
            type="text"
            placeholder="..."
            value={formData.budget}
            onChange={(e) => updateForm({ budget: e.target.value })}
          />
          <div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => setStep(4)}>Back</button>
            <button className={styles.button} onClick={handleSubmit}>Submit</button>
          </div>
        </>
      )}
    </div>
  );
};

export default FormBox;
