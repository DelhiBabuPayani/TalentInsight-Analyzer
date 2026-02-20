import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showMenu, setShowMenu] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const userName = localStorage.getItem("name") || "User";
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  // ====================== UPDATED UPLOAD HANDLER ======================
  const handleUpload = async () => {
    if (!file) return alert("Please select resume");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setUploadSuccess(false);

      const res = await API.post(`/upload/${userId}`, formData);

      setTimeout(() => setUploadSuccess(true), 400);

      setTimeout(() => {
        // ================= CASE: JOBS =================
        if (res.data.redirect === "jobs") {
          // NEW (for filter support)
          if (res.data.technical_jobs) {
            localStorage.setItem(
              "technical_jobs",
              JSON.stringify(res.data.technical_jobs)
            );
          }

          if (res.data.non_technical_jobs) {
            localStorage.setItem(
              "non_technical_jobs",
              JSON.stringify(res.data.non_technical_jobs)
            );
          }

          // BACKWARD COMPATIBILITY (old logic)
          if (res.data.jobs) {
            localStorage.setItem("jobs", JSON.stringify(res.data.jobs));
          }

          navigate("/jobs");
        }

        // ================= CASE: SKILL GAP =================
        else {
          sessionStorage.setItem("skill_gap_data", JSON.stringify(res.data));
          navigate("/skill-gap");
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };
  // ===================================================================

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ===== Drag & Drop =====
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setPreviewUrl(URL.createObjectURL(droppedFile));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    fileRef.current.value = "";
    setShowPreview(false);
  };

  return (
    <div className={`dashboard-page ${theme}`}>

      {/* ===== TOP BAR ===== */}
      <div className="dash-topbar">
        <div className="logo">TalentInsight</div>

        <div className="profile-menu">
          <div className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
            👤 {userName} ▾
          </div>

          {showMenu && (
            <div className="dropdown">
              <div onClick={() => navigate("/profile")}>Profile</div>
              <div onClick={() => navigate("/settings")}>Settings</div>
              <div onClick={() => navigate("/about")}>About</div>
              <div onClick={toggleTheme}>
                {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
              </div>
              <div className="logout" onClick={logout}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== STEPS INDICATOR ===== */}
      <div className="steps-bar">
        <div className="step active">1. Upload Resume</div>
        <div className={`step ${loading ? "active" : ""}`}>2. Analyzing</div>
        <div className="step">3. Results</div>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="dashboard-card">

        {/* LEFT INFO */}
        <div className="dash-left">
          <h1>Analyze Your Resume</h1>
          <p className="sub-text">
            Upload your resume to extract skills, identify gaps, and receive job recommendations tailored for you.
          </p>

          <ul className="feature-list">
            <li>✓ AI + Rule-based skill extraction</li>
            <li>✓ Job matching with market demand</li>
            <li>✓ Skill gap analysis & learning suggestions</li>
            <li>✓ ATS compatibility check</li>
          </ul>

          {/* EXTRA INFO CARDS */}
          <div className="info-cards">
            <div className="info-card">
              <h4>🎯 Why Upload?</h4>
              <p>Understand how recruiters see your profile and improve your chances.</p>
            </div>
            <div className="info-card">
              <h4>📊 What You Get</h4>
              <p>Skill report, job matches, and improvement suggestions.</p>
            </div>
            <div className="info-card">
              <h4>🚀 Quick Tip</h4>
              <p>Keep your resume updated for best matching results.</p>
            </div>
          </div>
        </div>

        {/* RIGHT UPLOAD */}
        <div className="upload-card">

          <div
            className={`upload-box ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
            onClick={() => fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >

            {!file && (
              <>
                <p className="upload-title">📄 Upload Resume</p>
                <span className="upload-sub">Drag & drop or click • PDF / DOCX</span>
              </>
            )}

            {file && (
              <div className="file-preview">
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <small>{(file.size / 1024).toFixed(1)} KB</small>

                  <div className="file-actions">
                    <span
                      className="preview-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(true);
                      }}
                    >
                      👁 Preview
                    </span>

                    <span
                      className="remove-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                    >
                      ❌ Remove
                    </span>
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.docx"
              hidden
              onChange={(e) => {
                const selected = e.target.files[0];
                if (!selected) return;
                setFile(selected);
                setPreviewUrl(URL.createObjectURL(selected));
              }}
            />
          </div>

          <button
            className="continue-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Continue"}
          </button>

          {/* ===== PROGRESS BAR ===== */}
          {loading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
              <p className="progress-text">Analyzing your resume... Please wait</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="success-anim">
              ✓ Uploaded Successfully
            </div>
          )}

        </div>
      </div>

      {/* ===== STATS SECTION ===== */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>10k+</h3>
          <p>Resumes Analyzed</p>
        </div>
        <div className="stat-card">
          <h3>95%</h3>
          <p>Accuracy Rate</p>
        </div>
        <div className="stat-card">
          <h3>500+</h3>
          <p>Companies Covered</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>AI Support</p>
        </div>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div className="activity-card">
        <h3>Recent Activity</h3>

        <div className="activity-item">
          <span>📄 Resume Uploaded</span>
          <small>Just now</small>
        </div>

        <div className="activity-item">
          <span>🎯 Skill Gap Analysis Generated</span>
          <small>Last session</small>
        </div>

        <div className="activity-item">
          <span>💼 Job Matches Viewed</span>
          <small>Yesterday</small>
        </div>
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      {showPreview && previewUrl && (
        <div className="preview-modal">
          <div className="preview-overlay" onClick={() => setShowPreview(false)} />

          <div className="preview-box">
            <div className="preview-header">
              <h3>Resume Preview</h3>
              <button onClick={() => setShowPreview(false)}>✖</button>
            </div>

            <div className="preview-body" style={{ height: "80vh" }}>
              <iframe
                src={previewUrl}
                title="Resume Preview"
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "8px" }}
              />
            </div>

            <div className="preview-footer">
              <button className="cancel-btn" onClick={() => setShowPreview(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
