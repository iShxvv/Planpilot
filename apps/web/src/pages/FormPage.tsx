import styles from "./FormPage.module.css";
import InitialPromptContainer from "../components/InitialUserPromptContainer.tsx";
import FormPageBg from "../assets/images/theme_Background.png";
import { useNavigate } from "react-router-dom";

export default function FormPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${FormPageBg})` }}>
      <header className={styles.navbar}>
        <nav className={styles.navLeft}>
          <div className={styles.navItem}>Create a New Event</div>
        </nav>
        <nav className={styles.navRight}>
          <div className={styles.brand}>planpilot</div>
          <button 
            className={styles.avatar} 
            aria-label="Go to home"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-rounded">home</span>
          </button>
        </nav>
      </header>
      <InitialPromptContainer />
    </div>
  );
}
