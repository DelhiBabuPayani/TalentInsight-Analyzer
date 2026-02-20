import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import API from "../api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    organization: "",
    experience: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  // ===== THEME SYNC FROM HOME =====
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isStrongPassword = (password) => {
  // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
  return regex.test(password);
};

const isOnlyLetters = (text) => {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(text);
};


 const handleRegister = async () => {
  setError("");

  // ===== EMPTY CHECK =====
  if (!form.name || !form.email || !form.password || !form.role || !form.experience) {
    setError("Please fill all required fields");
    return;
  }

  // ===== NAME VALIDATION =====
  if (!isOnlyLetters(form.name)) {
    setError("Name should contain only letters");
    return;
  }

  // ===== EMAIL VALIDATION =====
  if (!isValidEmail(form.email)) {
    setError("Please enter a valid email address");
    return;
  }

  // ===== PASSWORD VALIDATION =====
  if (!isStrongPassword(form.password)) {
    setError("Password must be 8+ chars with uppercase, lowercase, number & special character");
    return;
  }

  // ===== ROLE VALIDATION =====
  if (form.role === "") {
    setError("Please select a role");
    return;
  }

  // ===== EXPERIENCE VALIDATION =====
  if (form.experience === "") {
    setError("Please select experience");
    return;
  }

  // ===== CAPTCHA =====
  if (!captcha) {
    setError("Please verify captcha");
    return;
  }

  try {
    setLoading(true);

    await API.post("/register", {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      organization: form.organization || "NA",
      experience: form.experience
    });

    alert("Registration successful. Please login.");
    navigate("/login");

  } catch (err) {
    console.error("REGISTER ERROR:", err.response?.data || err.message);
    setError(err.response?.data?.detail || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-page">

      {/* ===== LEFT IMAGE SECTION ===== */}
      <div className="register-left">
        <div className="overlay"></div>
        <h1>Create Account</h1>
      </div>

      {/* ===== RIGHT FORM SECTION ===== */}
      <div className="register-right">

        <div className="back-btn" onClick={() => navigate("/")}>← Back</div>

        <h2>Register</h2>

        {error && <p className="error-text">{error}</p>}

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />

        <div className="password-box">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
          />
          <span onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "🙈" : "👁️"}
          </span>
        </div>

        {/* ===== ROLE DROPDOWN ===== */}
        <select name="role" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="student">Student</option>
        </select>

        {/* ===== EXPERIENCE DROPDOWN ===== */}
        <select name="experience" onChange={handleChange}>
          <option value="">Select Experience</option>
          <option value="fresher">Fresher</option>
          <option value="1 year">1 Year</option>
          <option value="2 years">2 Years</option>
          <option value="3+ years">3+ Years</option>
        </select>

        <input
          name="organization"
          placeholder="Organization (optional)"
          onChange={handleChange}
        />

        {/* ===== CAPTCHA ===== */}
        <div className="captcha-box">
          <ReCAPTCHA
            sitekey="6LcOptYrAAAAAFsr9ESzqdz0_7-yezaRKrmEjPxL"
            onChange={(val) => setCaptcha(val)}
          />
        </div>

        <button onClick={handleRegister} disabled={loading}>
          {loading ? <span className="loader"></span> : "Register"}
        </button>

        <p className="bottom-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>
    </div>
  );
}
