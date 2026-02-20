import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import JobMatching from "./pages/JobMatching";
import SkillGap from "./pages/SkillGap";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Settings from "./pages/Settings";   // ✅ ADD THIS
import AppliedJobs from "./pages/AppliedJobs";
import RequestReset from "./pages/RequestReset";
import OtpVerification from "./pages/OtpVerification";
import UpdatePassword from "./pages/UpdatePassword";
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ===== HOME ===== */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        {/* ===== AUTH ===== */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PageWrapper>
              <ForgotPassword />
            </PageWrapper>
          }
        />

        {/* ===== MAIN APP ===== */}
        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />

        <Route
          path="/jobs"
          element={
            <PageWrapper>
              <JobMatching />
            </PageWrapper>
          }
        />

        <Route
          path="/skill-gap"
          element={
            <PageWrapper>
              <SkillGap />
            </PageWrapper>
          }
        />

        <Route
          path="/profile"
          element={
            <PageWrapper>
              <Profile />
            </PageWrapper>
          }
        />

        <Route
          path="/settings"
          element={
            <PageWrapper>
              <Settings />
            </PageWrapper>
          }
        />

        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
        <Route path="/request-reset" element={<RequestReset />}s />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/update-password" element={<UpdatePassword />} />

      </Routes>
    </AnimatePresence>
  );
}

export default App;
