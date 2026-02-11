import styles from "./FormPage.module.css";
import InitialPromptContainer from "../components/InitialUserPromptContainer.tsx";
import FormPageBg from "../assets/images/FormPage_Background.png";

export default function FormPage() {
  return (
    <div className={styles.page} style={{ backgroundImage: `url(${FormPageBg})` }}>
      <header className={styles.navbar}>
        <nav className={styles.navLeft}>
          <div className={styles.navItem}>Create a New Event</div>
        </nav>
        <nav className={styles.navRight}>
          <div className={styles.brand}>planpilot</div>
          <div className={styles.avatar} aria-label="User avatar" />
        </nav>
      </header>
      <InitialPromptContainer />
    </div>
  );
}
