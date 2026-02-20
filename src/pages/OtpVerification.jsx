import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./ForgotPassword.css";

export default function OtpVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("reset_email");

  const handleVerify = async () => {
    setError("");

    if (!otp) return setError("Please enter OTP");

    try {
      setLoading(true);

      await API.post("/verify-otp", {
        email: email,
        otp: otp
      });

      navigate("/update-password");

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-right" style={{ width: "100%" }}>
        <h2>OTP Verification</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
