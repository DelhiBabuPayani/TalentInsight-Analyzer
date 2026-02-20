import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./AppliedJobs.css";

export default function AppliedJobs() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [theme, setTheme] = useState("light");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/applied-jobs/${userId}`);
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to load applied jobs", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    const confirmWithdraw = window.confirm("Withdraw this application?");
    if (!confirmWithdraw) return;

    try {
      await API.delete(`/withdraw-application/${applicationId}`);
      setJobs((prev) =>
        prev.filter((job) => job.application_id !== applicationId)
      );
      alert("Application withdrawn successfully");
    } catch (err) {
      alert("Failed to withdraw application");
    }
  };

  return (
    <div className={`profile-page ${theme}`}>
      {/* ===== TOP BAR ===== */}
      <div className="profile-topbar">
        <button className="icon-back" onClick={() => navigate("/profile")}>
          ←
        </button>
        <div>
          <h1>My Applied Jobs</h1>
          <p className="date">{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="profile-wrapper">
        {/* LEFT PANEL */}
        <div className="profile-side">
          <div className="profile-avatar">💼</div>
          <h2>Applied Jobs</h2>
          <p className="profile-email">Total: {jobs.length}</p>

          <div className="status-badge online">Active</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-content">
          {loading && <p className="loading-text">Loading applied jobs...</p>}

          {!loading && jobs.length === 0 && (
            <p className="empty-text">You have not applied to any jobs yet.</p>
          )}

          {!loading && jobs.length > 0 && (
            <div className="applied-table-wrapper">
              <table className="resume-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Skills</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr key={job.application_id}>
                      <td>{index + 1}</td>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.required_skills}</td>
                      <td>
                        <span
                          className={`status-pill ${job.status.toLowerCase()}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="withdraw-btn"
                          onClick={() => handleWithdraw(job.application_id)}
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
