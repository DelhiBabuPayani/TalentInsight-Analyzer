import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;
  }, []);

  return (
    <div className="about-page">

      <div className="about-hero">
        <h1>About TalentInsight</h1>
        <p>Helping students and professionals understand career gaps using AI.</p>
      </div>

      <div className="about-content">

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We aim to bridge the gap between skills and industry demand using AI-driven analysis.
          </p>
        </section>

        <section className="about-section">
          <h2>Why TalentInsight?</h2>
          <ul>
            <li>✔ Built for students & freshers</li>
            <li>✔ Transparent recommendations</li>
            <li>✔ No fake job data</li>
            <li>✔ Industry-aligned insights</li>
          </ul>
        </section>

        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}
