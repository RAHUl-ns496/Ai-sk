import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

// --- THEMES ---
const DARK = {
  bg: "rgba(17, 34, 64, 0.95)",
  text: "#E6F1FF",
  accent: "#64FFDA",
  border: "rgba(100, 255, 218, 0.15)",
  activeBg: "rgba(100, 255, 218, 0.12)",
  logoutBg: "#dc2626",
  cardBg: "rgba(10, 25, 47, 0.7)",
};

const LIGHT = {
  bg: "rgba(255, 255, 255, 0.96)",
  text: "#0f172a",
  accent: "#0d9488",
  border: "rgba(13, 148, 136, 0.2)",
  activeBg: "rgba(13, 148, 136, 0.1)",
  logoutBg: "#dc2626",
  cardBg: "rgba(248, 250, 252, 0.9)",
};

// --- HAPTIC FEEDBACK UTILITY ---
const triggerHaptic = (intensity = 'light') => {
  if (window.navigator.vibrate) {
    const pattern = intensity === 'heavy' ? [30] : [10];
    window.navigator.vibrate(pattern);
  }
};

// --- NAV ITEM ---
function NavItem({ to, icon, label, isActive, theme, isMobile }) {
  const color = isActive ? theme.accent : theme.text;

  const style = {
    textDecoration: "none",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    color: color,
    fontWeight: isActive ? "700" : "600",
    fontSize: isMobile ? "0.72rem" : "0.95rem",
    padding: isMobile ? "6px 0 2px" : "10px 14px",
    borderRadius: isMobile ? "8px" : "12px",
    background: !isMobile && isActive ? theme.activeBg : "transparent",
    transition: "all 0.2s ease",
    width: isMobile ? "100%" : "auto",
    textAlign: "center",
    gap: isMobile ? "3px" : "10px",
    minHeight: isMobile ? "40px" : "auto",
    opacity: 0.95,
  };

  return (
    <Link to={to} style={style}>
      <span
        style={{
          fontSize: isMobile ? "1.55rem" : "1.15rem",
          filter: isActive
            ? `drop-shadow(0 0 8px ${theme.accent}aa)`
            : "none",
          transition: "filter 0.2s ease",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

// --- DESKTOP SIDEBAR ---
function DesktopSidebar({ darkMode, setDarkMode, isMenuOpen, setIsMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = darkMode ? DARK : LIGHT;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    // Navigate handled by App.jsx or manually here
    navigate("/Login");
    setIsMenuOpen(false);
    triggerHaptic('heavy');
  };

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/predict", icon: "🔬", label: "Analyze Scan" },
    { to: "/camera", icon: "📷", label: "Live Capture" },
    { to: "/history", icon: "📁", label: "Archives" },
    { to: "/evaluation", icon: "🎯", label: "Model Stats" },
  ];

  return (
    <>
      <button
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
          triggerHaptic();
        }}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 201,
          background: theme.bg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${theme.border}`,
          color: theme.accent,
          padding: "10px",
          borderRadius: "12px",
          fontSize: "1.2rem",
          cursor: "pointer",
          boxShadow: darkMode
            ? "0 4px 16px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(0,0,0,0.06)",
        }}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsMenuOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode ? "rgba(2, 12, 27, 0.85)" : "rgba(241, 245, 249, 0.9)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s",
          zIndex: 199,
        }}
      />

      {/* Sidebar Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "260px",
          background: theme.bg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          color: theme.text,
          padding: "20px 12px",
          zIndex: 200,
          transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: darkMode
            ? "8px 0 32px rgba(0,0,0,0.6)"
            : "6px 0 24px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            background: darkMode
              ? "linear-gradient(135deg, #64FFDA, #CCD6F6)"
              : "linear-gradient(135deg, #0d9488, #0f172a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            marginBottom: "24px",
            letterSpacing: "-0.4px",
          }}
        >
          🧠 NeuralDoc
        </h2>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
              theme={theme}
              isMobile={false}
            />
          ))}
        </nav>

        {/* Account Section */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: darkMode ? "rgba(248, 113, 113, 0.06)" : "rgba(239, 68, 68, 0.04)",
            borderRadius: "14px",
            border: `1px solid ${darkMode ? "rgba(248,113,113,0.2)" : "rgba(239,68,68,0.15)"}`,
          }}
        >
          <div
            style={{
              color: darkMode ? "#8892B0" : "#64748b",
              fontSize: "0.7rem",
              textAlign: "center",
              marginBottom: "8px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Account
          </div>

          <button
            onClick={() => {
              setDarkMode(!darkMode);
              triggerHaptic();
            }}
            style={{
              background: darkMode ? "rgba(100,255,218,0.08)" : "rgba(13,148,136,0.08)",
              color: darkMode ? "#FFD700" : "#0d9488",
              border: `1px solid ${theme.border}`,
              padding: "8px 10px",
              width: "100%",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "8px",
              fontSize: "0.9rem",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "9px 10px",
              width: "100%",
              borderRadius: "10px",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            LOGOUT 🚪
          </button>
        </div>
      </div>
    </>
  );
}

// --- MOBILE MORE MENU ---
function MobileMoreMenu({ darkMode, setDarkMode, isOpen, onClose, onLogout }) {
  const theme = darkMode ? DARK : LIGHT;
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(82px + env(safe-area-inset-bottom, 0px))",
        right: "16px",
        background: theme.cardBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: `1px solid ${theme.border}`,
        boxShadow: darkMode
          ? "0 6px 24px rgba(0,0,0,0.5)"
          : "0 6px 20px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 101,
        minWidth: "160px",
        animation: "slideUp 0.25s ease forwards",
      }}
      ref={menuRef}
    >
      <button
        onClick={() => {
          setDarkMode(!darkMode);
          onClose();
          triggerHaptic();
        }}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          color: darkMode ? "#FFD700" : "#0d9488",
          fontWeight: "700",
          fontSize: "0.92rem",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <div style={{ height: "1px", background: theme.border, margin: "0 16px" }} />
      <button
        onClick={() => {
          onLogout();
          onClose();
          triggerHaptic('heavy');
        }}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          color: "#ef4444",
          fontWeight: "700",
          fontSize: "0.92rem",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

// --- MOBILE BOTTOM NAVIGATION ---
function MobileBottomNav({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const theme = darkMode ? DARK : LIGHT;

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/Login");
  }, [navigate]);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Home" },
    { to: "/predict", icon: "🔬", label: "Scan" },
    { to: "/history", icon: "📁", label: "History" },
    { to: "/evaluation", icon: "🎯", label: "Stats" },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "68px",
          background: theme.bg,
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 4px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 100,
          boxShadow: darkMode
            ? "0 -2px 12px rgba(0,0,0,0.45)"
            : "0 -2px 8px rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
            theme={theme}
            isMobile={true}
          />
        ))}
      </div>

      {/* Floating Action Button (More) */}
      <button
        onClick={() => {
          setIsMoreOpen(!isMoreOpen);
          triggerHaptic();
        }}
        style={{
          position: "fixed",
          bottom: "calc(82px + env(safe-area-inset-bottom, 0px))",
          right: "16px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: theme.accent,
          color: darkMode ? DARK.bg : LIGHT.bg,
          border: "none",
          fontSize: "1.3rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: darkMode
            ? "0 4px 16px rgba(100, 255, 218, 0.6)"
            : "0 4px 16px rgba(13, 148, 136, 0.5)",
          zIndex: 102,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s ease",
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
        onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="More options"
      >
        ⋮
      </button>

      <MobileMoreMenu
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    body {
      margin: 0;
      padding: 0;
      overscroll-behavior-y: contain;
      height: 100vh;
      overflow-x: hidden;
    }
    #root, .app-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex: 1;
      width: 100%;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
      box-sizing: border-box;
      overflow-y: auto;
    }
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
  `}</style>
);

// --- MAIN EXPORT ---
export default function Sidebar({ darkMode, setDarkMode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <GlobalStyles />
      {isMobile ? (
        <MobileBottomNav darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : (
        <DesktopSidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
    </>
  );
}