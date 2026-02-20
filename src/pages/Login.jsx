import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import API from "../api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ===== THEME SYNC WITH HOME =====
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;
  }, []);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (!captcha) {
      setError("Please verify captcha");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/login", {
        email: email,
        password: password
      });

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);           // ✅ ADD THIS
      localStorage.setItem("role", res.data.role || "");
      localStorage.setItem("organization", res.data.organization || "");
      localStorage.setItem("experience", res.data.experience || "");

      

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      {/* LEFT IMAGE */}
      <div className="login-image">
        <div className="overlay-text">
          <h1>Welcome Back</h1>
          <p>Login to continue your journey</p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="login-form-section">

        <div className="back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </div>

        <h2>Login</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-box">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="forgot" onClick={() => navigate("/request-reset")}>
          Forgot password?
        </div>

        {/* CAPTCHA */}
        <div className="captcha-box">
          <ReCAPTCHA
            sitekey="6LcOptYrAAAAAFsr9ESzqdz0_7-yezaRKrmEjPxL"
            onChange={(val) => setCaptcha(val)}
          />
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <div className="loader"></div> : "Login"}
        </button>

        <p className="register-text">
          Don’t have an account?
          <span onClick={() => navigate("/register")}> Register now</span>
        </p>

      </div>
    </div>
  );
}
