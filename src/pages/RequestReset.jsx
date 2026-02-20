import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import API from "../api";
import "./ForgotPassword.css";

export default function RequestReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;
  }, []);

  const handleSend = async () => {
    setError("");

    if (!email) return setError("Please enter email");
    if (!captcha) return setError("Please verify captcha");

    try {
      setLoading(true);

      const res = await API.post("/forgot-password", { email });

      const otp = res.data.otp;

      // Demo popup
      alert(`Reset code (demo): ${otp}`);

      localStorage.setItem("reset_email", email);

      navigate("/otp-verification");

    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-left">
        <div className="overlay"></div>
        <h1>Reset Password</h1>
        <p>Secure your account</p>
      </div>

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

        <div className="captcha-box">
          <ReCAPTCHA
            sitekey="6LcOptYrAAAAAFsr9ESzqdz0_7-yezaRKrmEjPxL"
            onChange={(val) => setCaptcha(val)}
          />
        </div>

        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </div>
    </div>
  );
}
