import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FormPage.module.css';
import FormPageBg from "../assets/images/theme_Background.png";

export default function FormPage() {
    const [prompt, setPrompt] = useState("");
    const navigate = useNavigate();

    const handleNext = () => {
        if (!prompt.trim()) return;

        // Generate a new ID for the plan
        const newPlanId = crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`;

        // Navigate to the new plan URL with the prompt in state
        navigate(`/plan/${newPlanId}`, { state: { initialPrompt: prompt } });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNext();
        }
    };

    return (
        <div className={styles.page} style={{ backgroundImage: `url(${FormPageBg})` }}>
            <header className={styles.topBar}>
                <div className={styles.headerTitle}>Create a New Event</div>
                <div className={styles.topRight}>
                    <div className={styles.brand}>planpilot</div>
                    <button className={styles.homeBtn} onClick={() => navigate('/')}>
                        <span className="material-symbols-rounded">home</span>
                    </button>
                </div>
            </header>

            <div className={styles.container}>
                <h1 className={styles.mainHeading}>Let's get your event started</h1>

                <label className={styles.questionLabel}>Tell us whatever you want about the event you're planning.</label>

                <div className={styles.inputWrapper}>
                    <input
                        autoFocus
                        className={styles.inputField}
                        placeholder="I'd like to create a birthday party for my 12 year old..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className={styles.helperText}>
                    Feel free to explain your answer approximately.
                </div>

                <button className={styles.nextButton} onClick={handleNext}>
                    Next
                    <span className="material-symbols-rounded">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
