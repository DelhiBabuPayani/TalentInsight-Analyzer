import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SkillGap.css";

export default function SkillGap() {
  const [missingSkills, setMissingSkills] = useState([]);
  const [courses, setCourses] = useState({});
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    const stored = sessionStorage.getItem("skill_gap_data");
    if (stored) {
      const data = JSON.parse(stored);
      setMissingSkills(data.missing_skills || []);
      setCourses(data.recommended_courses || {});
    }
  }, []);

  const openCourse = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className={`skillgap-page ${theme}`}>
      {/* ===== HEADER ===== */}
      <div className="skillgap-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <div className="header-text">
          <h1>Skill Gap Analysis</h1>
          <p>Improve the following skills to increase job match</p>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="skillgap-grid">

        {missingSkills.length === 0 && (
          <div className="no-skill-card">
            🎉 Your skills are strong. No gaps found!
          </div>
        )}

        {missingSkills.map((skill, index) => (
          <div className="skill-card" key={index}>
            <div className="skill-card-header">
              <span className="alert-icon">⚠</span>
              <h3>{skill.toUpperCase()}</h3>
            </div>

            <div className="skill-card-body">

              {/* ===== MULTIPLE COURSES ===== */}
              {courses[skill] && courses[skill].length > 0 ? (
                courses[skill].map((course, idx) => (
                  <div key={idx} className="course-box">

                    <div className="skill-row">
                      <span className="label">📘 Course</span>
                      <span className="value">{course.title}</span>
                    </div>

                    <div className="skill-row">
                      <span className="label">🎥 Tutorial</span>
                      <span
                        className="link"
                        onClick={() => openCourse(course.url)}
                      >
                        Learn here
                      </span>
                    </div>

                    <div className="skill-row">
                      <span className="label">🛠 Practice</span>
                      <span className="value">
                        Build projects & solve problems
                      </span>
                    </div>

                    <hr style={{ opacity: 0.3 }} />

                  </div>
                ))
              ) : (
                <div className="skill-row">
                  <span className="label">📘 Resource</span>
                  <span className="value">Recommended resource coming soon</span>
                </div>
              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
