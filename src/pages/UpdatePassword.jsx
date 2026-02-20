import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./ForgotPassword.css";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("reset_email");

  const handleReset = async () => {
    setError("");

    if (!password || !confirm) return setError("Please fill all fields");
    if (password !== confirm) return setError("Passwords do not match");

    try {
      setLoading(true);

      await API.post("/reset-password", {
        email: email,
        new_password: password
      });

      alert("Password reset successful");

      localStorage.removeItem("reset_email");
      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-right" style={{ width: "100%" }}>
        <h2>Update Password</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={handleReset} disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
