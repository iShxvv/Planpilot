import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InitialUserPromptContainer.module.css";

type Stage = "initial" | "loading" | "complete";

const InitialUserPromptContainer = () => {
  const [stage, setStage] = useState<Stage>("initial");
  const [userInput, setUserInput] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setStage("loading");
    
    // Send the user input to backend AI workflow
    setTimeout(() => {
      setStage("complete");
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleStartPlanning = () => {
    // Log collected options for backend
    console.log("User wants to add:", customOptions.join(", "));
    navigate("/plan");
  };

  const handleBack = () => {
    setStage("initial");
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

  const handleOptionKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveOption();
    }
  };

  return (
    <div className={styles.promptContainer}>
      {stage === "initial" && (
        <>
          <h1 className={styles.mainHeading}>Let's get your event started</h1>
          <p className={styles.aiPrompt}>What kind of event are you planning?</p>
          <input
            type="text"
            className={styles.userInput}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder=""
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
          <p className={styles.userPromptDisplay}>{userInput}</p>
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
                onKeyDown={handleOptionKeyPress}
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
