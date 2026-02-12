// Landing.tsx
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import LandingPageBg from "../assets/images/LandingPage_Background.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${LandingPageBg})` }}>
      {/* Sticky Navbar */}
      <header className={styles.navbar}>
        {/* Left Nav Items (PlanPilot Logo) */}
        <div className={styles.navLeft}>
          <div className={styles.navItem} onClick={() => scrollToSection('hero')}>planpilot</div>
        </div>

        {/* Center Nav Items (References on Landing Page) */}
        <div className={styles.navCenter}>
          <div className={styles.navItem} onClick={() => scrollToSection('about')}>About</div>
          <div className={styles.navItem} onClick={() => scrollToSection('features')}>Features</div>
          <div className={styles.navItem} onClick={() => scrollToSection('support')}>Support</div>
        </div>

        {/* Right Nav Items (Login) */}
        <div className={styles.navRight}>
          <div className={styles.navItem}>Login</div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className={styles.section}>
        <main className={styles.hero}>
          <h1 className={styles.title}>PlanPilot</h1>
          <p className={styles.subtitle}>We take the guesswork out of your events</p>
          <button
            className={styles.cta}
            onClick={() => navigate("/plan")}>
            Get Started
          </button>
        </main>
      </section>

      {/* About Section */}
      <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>About PlanPilot</h2>
          <p className={styles.sectionText}>
            PlanPilot is your intelligent event planning assistant. We use AI to help you create
            memorable events without the stress. From weddings to corporate gatherings, we've got you covered.
          </p>
          <p className={styles.sectionText}>
            Our platform streamlines the entire planning process, suggesting venues, activities, and
            timelines tailored to your specific needs and budget.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${styles.section} ${styles.featuresSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureImage} style={{ backgroundImage: `url(${LandingPageBg})` }}></div>
              <h3 className={styles.featureTitle}>AI-Powered Planning</h3>
              <ul className={styles.featureList}>
                <li>Smart recommendations tailored to your event</li>
                <li>Intelligent venue and vendor suggestions</li>
                <li>Personalized activity ideas based on your preferences</li>
              </ul>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureImage} style={{ backgroundImage: `url(${LandingPageBg})` }}></div>
              <h3 className={styles.featureTitle}>Automated Email</h3>
              <ul className={styles.featureList}>
                <li>Send invitations automatically to your guest list</li>
                <li>Track RSVPs and responses in real-time</li>
                <li>Automated reminders and follow-ups</li>
              </ul>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureImage} style={{ backgroundImage: `url(${LandingPageBg})` }}></div>
              <h3 className={styles.featureTitle}>Budget Tracking</h3>
              <ul className={styles.featureList}>
                <li>Real-time expense monitoring and alerts</li>
                <li>Categorized spending breakdown</li>
                <li>Stay within budget with smart recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className={`${styles.section} ${styles.supportSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Support</h2>
          <p className={styles.sectionText}>
            Need help? We're here for you every step of the way.
          </p>
          <div className={styles.supportOptions}>
            <div className={styles.supportCard}>
              <h3 className={styles.featureTitle}>Email Support</h3>
              <p className={styles.featureText}>support@planpilot.com</p>
            </div>
            <div className={styles.supportCard}>
              <h3 className={styles.featureTitle}>Live Chat</h3>
              <p className={styles.featureText}>Available 9am - 5pm EST</p>
            </div>
            <div className={styles.supportCard}>
              <h3 className={styles.featureTitle}>Help Center</h3>
              <p className={styles.featureText}>Browse our FAQ and guides</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
