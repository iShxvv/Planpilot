// Landing.tsx
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>

        <header className={styles.navbar}>
          <nav className={styles.navLeft}>
            <div className={styles.navItem}>planpilot</div>
            
          </nav>

        </header>

        <main className={styles.hero}>
          <h1 className={styles.title}>PlanPilot</h1>
          <p className={styles.subtitle}>We take the guesswork out of your events</p>
          <button className={styles.cta}>Get Started</button>
        </main>

        
      </div>
    </div>
  );
}
