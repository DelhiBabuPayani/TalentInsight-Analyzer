import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobMatching.css";

export default function JobMatching() {
  const navigate = useNavigate();

  const [technicalJobs, setTechnicalJobs] = useState([]);
  const [nonTechnicalJobs, setNonTechnicalJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("technical");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    const tech = JSON.parse(localStorage.getItem("technical_jobs")) || [];
    const nonTech = JSON.parse(localStorage.getItem("non_technical_jobs")) || [];

    const oldJobs = JSON.parse(localStorage.getItem("jobs")) || [];

    if (tech.length === 0 && nonTech.length === 0 && oldJobs.length > 0) {
      setTechnicalJobs(oldJobs);
      setNonTechnicalJobs([]);
    } else {
      setTechnicalJobs(tech);
      setNonTechnicalJobs(nonTech);
    }
  }, []);

  const applyJob = async (job) => {
    const userId = localStorage.getItem("user_id");

    try {
      const res = await fetch("http://127.0.0.1:8000/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: job.title,
          company: job.company,
          required_skills: job.match ? job.match.toString() : ""
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Job applied successfully!");
      } else {
        alert(data.detail || "Failed to apply job");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while applying job");
    }
  };

  const jobsToShow =
    activeFilter === "technical" ? technicalJobs : nonTechnicalJobs;

  return (
    <div className={`profile-page ${theme}`}>
      {/* ===== TOP BAR ===== */}
      <div className="profile-topbar">
        <button className="icon-back" onClick={() => navigate("/dashboard")}>
          ←
        </button>
        <div>
          <h1>Job Matching Results</h1>
          <p className="date">{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="profile-wrapper">
        {/* LEFT PANEL */}
        <div className="profile-side">
          <div className="profile-avatar">💼</div>
          <h2>Job Matches</h2>
          <p className="profile-email">
            Technical: {technicalJobs.length} <br />
            Non-Technical: {nonTechnicalJobs.length}
          </p>

          <div className="status-badge online">Active</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-content">
          {/* ===== FILTER BUTTONS ===== */}
          <div className="filter-bar">
            <button
              className={`filter-btn ${
                activeFilter === "technical" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("technical")}
            >
              Technical Jobs
            </button>

            <button
              className={`filter-btn ${
                activeFilter === "non-technical" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("non-technical")}
            >
              Non-Technical Jobs
            </button>
          </div>

          {/* ===== NO JOB MESSAGE ===== */}
          {jobsToShow.length === 0 && (
            <p className="empty-text">
              ❌ No suitable jobs found in this category.
            </p>
          )}

          {/* ===== JOB CARDS ===== */}
          {jobsToShow.map((job, i) => (
            <div className="job-card" key={i}>
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-match">{job.match}% Match</span>
              </div>

              <p className="job-company">🏢 {job.company}</p>
              <p className="job-category">
                Category: <b>{job.category || activeFilter}</b>
              </p>

              <div className="job-actions">
                {job.apply_link && (
                  <a href={job.apply_link} target="_blank" rel="noreferrer">
                    <button className="view-btn">View Job</button>
                  </a>
                )}

                <button
                  className="apply-btn"
                  onClick={() => applyJob(job)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
