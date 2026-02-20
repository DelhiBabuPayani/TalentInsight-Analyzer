import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);

  const revealRefs = useRef([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  // ===== Scroll Reveal =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach(el => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 1800);
  };

  return (
    <div className="home-wrapper">

      {/* ================= HERO ================= */}
      <div className="hero-bg">
        <div className="hero-overlay"></div>

        <div className="navbar">
          <div className="logo">TalentInsight</div>

          <div className="nav-links">
            <span onClick={() => window.location.reload()}>Home</span>
            <span onClick={() => navigate("/about")}>About</span>
            <span className="icon" onClick={toggleTheme}>
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
          </div>
        </div>

        <div className="hero-content">
          <h1>Understand Why Your Resume Gets Rejected</h1>
          <p>AI-powered skill extraction, job matching and career insights.</p>

          <button
  className={`get-started-btn ${loading ? "loading" : ""}`}
  onClick={handleGetStarted}
  disabled={loading}
>
  {loading ? <span className="btn-spinner"></span> : "Get Started"}
</button>

{loading && <div className="loading-bar"></div>}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="content-section">

        <h2 className="section-title reveal" ref={el => revealRefs.current[0] = el}>
          Key Features
        </h2>

        <div className="features-row">
          <div className="feature-box reveal" ref={el => revealRefs.current[1] = el}>
            <h3>AI Skill Extraction</h3>
            <p>Extracts technical and soft skills automatically.</p>
          </div>

          <div className="feature-box reveal" ref={el => revealRefs.current[2] = el}>
            <h3>Job Matching</h3>
            <p>Matches you with roles based on real demand.</p>
          </div>

          <div className="feature-box reveal" ref={el => revealRefs.current[3] = el}>
            <h3>Skill Gap Analysis</h3>
            <p>Shows what skills you need to improve.</p>
          </div>
        </div>

        <div className="why-section reveal" ref={el => revealRefs.current[4] = el}>
          <h2>Why TalentInsight?</h2>
          <p className="why-text">
            Most candidates don’t know why resumes get rejected. TalentInsight gives clear, data-backed answers.
          </p>

          <ul className="why-list">
            <li>✔ Built for students & freshers</li>
            <li>✔ No fake job data</li>
            <li>✔ Transparent recommendations</li>
            <li>✔ Industry-aligned insights</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
