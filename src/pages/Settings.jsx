import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [autoLogout, setAutoLogout] = useState(
    localStorage.getItem("autoLogout") === "true"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  /* ================= THEME SYNC ================= */
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= AUTO LOGOUT LOGIC (REAL) ================= */
  useEffect(() => {
    if (!autoLogout) return;

    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert("Session expired. You have been logged out.");
        localStorage.clear();
        navigate("/login");
      }, 5 * 60 * 1000); // 5 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer(); // start timer immediately

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [autoLogout, navigate]);

  /* ================= HANDLERS ================= */
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const toggleAutoLogout = () => {
    const val = !autoLogout;
    setAutoLogout(val);
    localStorage.setItem("autoLogout", val);
  };

  const toggleNotifications = () => {
    const val = !notifications;
    setNotifications(val);
    localStorage.setItem("notifications", val);
  };

  return (
    <div className={`settings-page ${theme}`}>
      {/* ===== TOP BAR ===== */}
      <div className="settings-topbar">
        <button className="icon-back" onClick={() => navigate("/dashboard")}>
          ←
        </button>
        <h1>Settings</h1>
      </div>

      {/* ===== CARD ===== */}
      <div className="settings-card">

        {/* THEME */}
        <div className="setting-row">
          <div>
            <h3>Theme</h3>
            <p>Switch between light and dark mode</p>
          </div>
          <button className="toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* AUTO LOGOUT */}
        <div className="setting-row">
          <div>
            <h3>Auto Logout</h3>
            <p>Automatically logout after 5 minutes inactivity</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={autoLogout} onChange={toggleAutoLogout} />
            <span className="slider"></span>
          </label>
        </div>

        {/* NOTIFICATIONS */}
        <div className="setting-row">
          <div>
            <h3>Notifications</h3>
            <p>Enable system notifications</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={toggleNotifications}
            />
            <span className="slider"></span>
          </label>
        </div>

      </div>
    </div>
  );
}
