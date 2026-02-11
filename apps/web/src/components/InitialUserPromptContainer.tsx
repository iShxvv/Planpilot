import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InitialUserPromptContainer.module.css";

type Stage = "initial" | "clarifying" | "loading" | "complete";

const InitialUserPromptContainer = () => {
  const [stage, setStage] = useState<Stage>("initial");
  const [userInput, setUserInput] = useState("");
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [clarifyingCount, setClarifyingCount] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("What kind of event are you planning?");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Auto-resize textarea (max 3 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 43; // Approximate line height for 36px font
      const maxHeight = lineHeight * 3;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [userInput]);

  // Hardcoded AI responses for clarifying stage
  const clarifyingPrompts = [
    "Great! When are you planning to have this event?",
    "Perfect! Where would you like to host this event?",
    "Thank you! I have all the information I need to create your plan."
  ];

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    if (stage === "initial") {
      // First message - go to clarifying stage
      setUserMessages([userInput]);
      setCurrentPrompt(clarifyingPrompts[0]);
      setStage("clarifying");
      setUserInput("");
      setClarifyingCount(0);
    } else if (stage === "clarifying") {
      // Add message to user messages
      const updatedMessages = [...userMessages, userInput];
      setUserMessages(updatedMessages);
      
      const newCount = clarifyingCount + 1;
      setClarifyingCount(newCount);
      
      if (newCount >= 2) {
        // After 2 clarifying messages, go to loading
        setStage("loading");
        setTimeout(() => {
          setStage("complete");
        }, 3000);
      } else {
        // Continue clarifying
        setCurrentPrompt(clarifyingPrompts[newCount]);
        setUserInput("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartPlanning = () => {
    // Log collected options and user messages for backend
    console.log("User messages:", userMessages);
    console.log("User wants to add:", customOptions.join(", "));
    navigate("/plan");
  };

  const handleBack = () => {
    if (stage === "complete") {
      // Combine all user messages and put back in text area
      setUserInput(userMessages.join(" "));
      setStage("initial");
    } else {
      setStage("initial");
      setUserMessages([]);
      setClarifyingCount(0);
      setCurrentPrompt("What kind of event are you planning?");
    }
  };

  const handleAddOption = () => {
    setIsAddingOption(true);
  };

  const handleSaveOption = () => {
    if (newOptionText.trim()) {
      setCustomOptions([...customOptions, newOptionText.trim()]);
      setNewOptionText("");
      setIsAddingOption(false);
    }
  };

  const handleRemoveOption = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveOption();
    }
  };

  // Get combined user messages for display
  const getCombinedUserMessages = () => {
    return userMessages.join(" ");
  };

  return (
    <div className={styles.promptContainer}>
      {stage === "initial" && (
        <>
          <h1 className={styles.mainHeading}>Let's get your event started</h1>
          <p className={styles.aiPrompt}>{currentPrompt}</p>
          <textarea
            ref={textareaRef}
            className={styles.userInput}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            rows={1}
          />
          <div className={styles.bottomRow}>
            <p className={styles.disclaimer}>Feel free to explain your answer approximately</p>
            <button className={styles.submitButton} onClick={handleSubmit}>
              Next
            </button>
          </div>
        </>
      )}

      {stage === "clarifying" && (
        <>
          <div className={styles.previousAnswers}>
            {userMessages.map((msg, index) => (
              <p key={index} className={styles.previousAnswer}>
                {msg}
              </p>
            ))}
          </div>
          <p className={styles.aiPrompt}>{currentPrompt}</p>
          <textarea
            ref={textareaRef}
            className={styles.userInput}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            rows={1}
          />
          <div className={styles.bottomRow}>
            <p className={styles.disclaimer}>Feel free to explain your answer approximately</p>
            <button className={styles.submitButton} onClick={handleSubmit}>
              Next
            </button>
          </div>
        </>
      )}

      {stage === "loading" && (
        <>
          <h1 className={styles.mainHeading}>Creating your plan now</h1>
          <p className={styles.userPromptDisplay}>{getCombinedUserMessages()}</p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill}></div>
          </div>
        </>
      )}

      {stage === "complete" && (
        <>
          <h2 className={styles.subHeading}>Your event is on the way!<br />Would you like to add anything else?</h2>
          <div className={styles.optionsContainer}>
            {customOptions.map((option, index) => (
              <div key={index} className={styles.optionWrapper}>
                <button className={styles.optionButton}>
                  {option}
                </button>
                <button 
                  className={styles.removeButton} 
                  onClick={() => handleRemoveOption(index)}
                >
                  ×
                </button>
              </div>
            ))}
            {isAddingOption ? (
              <input
                type="text"
                className={styles.optionInput}
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={handleOptionKeyDown}
                onBlur={handleSaveOption}
                autoFocus
                placeholder="Type option..."
              />
            ) : (
              <button className={styles.addButton} onClick={handleAddOption}>
                +
              </button>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.backButton} onClick={handleBack}>
              Back
            </button>
            <button className={styles.startPlanningButton} onClick={handleStartPlanning}>
              Start Planning
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InitialUserPromptContainer;
