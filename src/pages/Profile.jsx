import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const [resumeHistory, setResumeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [form, setForm] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "Not available",
    role: localStorage.getItem("role") || "",
    organization: localStorage.getItem("organization") || "",
    experience: localStorage.getItem("experience") || ""
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPwd: "",
    confirm: ""
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    if (userId) {
      fetchResumeHistory();
    }
  }, [userId]);

  const fetchResumeHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await API.get(`/resume/history/${userId}`);

      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && typeof res.data === "object") {
        data = Object.values(res.data);
      }

      setResumeHistory(data);
    } catch (err) {
      console.error("Failed to fetch resume history", err);
      setResumeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const confirmClear = window.confirm(
      "⚠️ This will permanently delete all your resume history. Are you sure?"
    );
    if (!confirmClear) return;

    try {
      setClearing(true);
      await API.delete(`/resume/clear/${userId}`);
      setResumeHistory([]);
      alert("Resume history cleared successfully");
    } catch (err) {
      alert("Failed to clear resume history");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteSingle = async (resumeId) => {
    const confirmDelete = window.confirm("Delete this resume?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/resume/${resumeId}`);
      setResumeHistory((prev) => prev.filter((r) => r.resume_id !== resumeId));
    } catch (err) {
      alert("Failed to delete resume");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    if (!form.role.trim()) return setError("Role is required");
    if (!form.experience.trim()) return setError("Experience is required");

    localStorage.setItem("name", form.name);
    localStorage.setItem("role", form.role);
    localStorage.setItem("organization", form.organization);
    localStorage.setItem("experience", form.experience);

    alert("Profile updated successfully");
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess("");

    if (!passwords.current || !passwords.newPwd || !passwords.confirm) {
      return setPwdError("All password fields are required");
    }

    if (passwords.newPwd !== passwords.confirm) {
      return setPwdError("New passwords do not match");
    }

    try {
      await API.post("/change-password", {
        user_id: userId,
        current_password: passwords.current,
        new_password: passwords.newPwd
      });

      setPwdSuccess("Password updated successfully");
      setPasswords({ current: "", newPwd: "", confirm: "" });
    } catch (err) {
      setPwdError(err.response?.data?.detail || "Password update failed");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ This will permanently delete your account. Are you sure?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await API.delete(`/delete-account/${userId}`);
      localStorage.clear();
      alert("Account deleted successfully");
      navigate("/");
    } catch (err) {
      alert("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const isOnline = navigator.onLine;

  const formatDateOnly = (dt) => {
    if (!dt) return "";
    const date = new Date(dt);
    return date.toLocaleDateString("en-US");
  };

  return (
    <div className={`profile-page ${theme}`}>
      {/* ===== TOP BAR ===== */}
      <div className="profile-topbar">
        <button className="icon-back" onClick={() => navigate("/dashboard")}>
          ←
        </button>
        <div>
          <h1>My Profile</h1>
          <p className="date">{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="profile-wrapper">
        {/* ===== LEFT PANEL ===== */}
        <div className="profile-side">
          <div className="profile-avatar">👤</div>
          <h2>{form.name || "User"}</h2>
          <p className="profile-email">{form.email || "Not available"}</p>

          <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="profile-content">
          {/* BASIC INFO */}
          <h3 className="section-title">Basic Information</h3>

          <div className="field-grid">
            <div className="field-box">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="field-box">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Select role</option>
                <option value="job_seeker">Job Seeker</option>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <div className="field-box">
              <label>Organization</label>
              <input
                name="organization"
                value={form.organization}
                onChange={handleChange}
              />
            </div>

            <div className="field-box">
              <label>Experience</label>
              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
              >
                <option value="">Select experience</option>
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            <div className="field-box full">
              <label>Email</label>
              <input value={form.email} disabled />
            </div>
          </div>

          <div className="profile-actions">
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>

            <button
              className="applied-btn"
              onClick={() => navigate("/applied-jobs")}
            >
              My Applied Jobs
            </button>
          </div>

         

          {/* RESUME HISTORY */}
          <div className="resume-history-card">
            <div className="history-header">
              <h3>📄 Resume Upload History</h3>

              {resumeHistory.length > 0 && (
                <button
                  className="clear-history-btn"
                  onClick={handleClearHistory}
                  disabled={clearing}
                >
                  {clearing ? "Clearing..." : "Clear History"}
                </button>
              )}
            </div>

            {historyLoading && (
              <p className="loading-text">Loading history...</p>
            )}

            {!historyLoading && resumeHistory.length === 0 && (
              <p className="empty-text">No resumes uploaded yet.</p>
            )}

            {!historyLoading && resumeHistory.length > 0 && (
              <table className="resume-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Uploaded At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resumeHistory.map((item, index) => (
                    <tr key={item.resume_id}>
                      <td>{index + 1}</td>
                      <td>{item.file_name}</td>
                      <td>{formatDateOnly(item.uploaded_at)}</td>
                      <td>
                        <button
                          className="delete-single-btn"
                          onClick={() =>
                            handleDeleteSingle(item.resume_id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* DANGER ZONE */}
          <h3 className="section-title danger">Danger Zone</h3>

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
