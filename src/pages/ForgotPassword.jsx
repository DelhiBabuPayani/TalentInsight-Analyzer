import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import API from "../api";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== THEME SYNC =====
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;
  }, []);

  const handleSend = async () => {
    setError("");

    if (!email) {
      setError("Please enter email");
      return;
    }

    if (!captcha) {
      setError("Please verify captcha");
      return;
    }

    try {
      setLoading(true);

      // 🔹 CALL API FIRST
      const res = await API.post("/forgot-password", { email });

      // 🔹 STORE EMAIL ONLY AFTER SUCCESS
      localStorage.setItem("reset_email", email);

      alert(res.data.message || "Reset code sent");

      // 🔹 GO TO OTP PAGE
      navigate("/verify-otp");

    } catch (err) {
      console.error("FORGOT ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* ===== LEFT IMAGE ===== */}
      <div className="forgot-left">
        <div className="overlay"></div>
        <h1>Reset Password</h1>
        <p>Secure your account</p>
      </div>

      {/* ===== RIGHT FORM ===== */}
      <div className="forgot-right">

        <div className="back-btn" onClick={() => navigate("/login")}>
          ← Back to Login
        </div>

        <h2>Forgot Password</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ===== CAPTCHA ===== */}
        <div className="captcha-box">
          <ReCAPTCHA
            sitekey="6LcOptYrAAAAAFsr9ESzqdz0_7-yezaRKrmEjPxL"
            onChange={(val) => setCaptcha(val)}
          />
        </div>

        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </div>
    </div>
  );
}
