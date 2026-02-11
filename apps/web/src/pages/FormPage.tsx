import styles from "./FormPage.module.css";
import FormBox from "../components/FormBox";
import { useNavigate } from "react-router-dom";

export default function FormPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>

        <header className={styles.navbar}>
          <nav className={styles.navLeft}>
            <div className={styles.navItem}>Create a New Event</div>
          </nav>
          <nav className={styles.navRight}>
            <div className={styles.navItem}>PlanPilot</div>
          </nav>
        </header>

        <FormBox />
    
      </div>
    </div>
  );
}
