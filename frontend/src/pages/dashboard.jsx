import { useEffect, useState, useRef } from "react";
import { getDashboard } from "../services/api";

// --- COLOR PALETTES (ENHANCED DARK MODE) ---
const DARK_COLORS = {
  BG: 'radial-gradient(circle at 30% 20%, #010812, #000208)',
  CARD_BG: 'rgba(8, 18, 36, 0.82)', // Deeper, more premium
  BORDER: 'rgba(100, 255, 218, 0.12)',
  ACCENT_TEAL: '#64FFDA',
  ACCENT_GOLD: '#FFD700',
  ACCENT_BLUE: '#60a5fa',
  ACCENT_GREEN: '#10b981',
  TEXT_LIGHT: '#E6F1FF',
  TEXT_MUTED: '#A0AEC0',
};

const LIGHT_COLORS = {
  BG: 'radial-gradient(circle at 30% 20%, #f0f9ff, #e0f2fe)',
  CARD_BG: 'rgba(255, 255, 255, 0.85)',
  BORDER: 'rgba(0, 150, 255, 0.2)',
  ACCENT_TEAL: '#0d9488',
  ACCENT_GOLD: '#d4af37',
  ACCENT_BLUE: '#2563eb',
  ACCENT_GREEN: '#047857',
  TEXT_LIGHT: '#0c0a09',
  TEXT_MUTED: '#4b5563',
};

// --- THEME HOOK (UNCHANGED) ---
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return [theme, setTheme];
};

// --- HERO SLIDER COMPONENT (MOBILE-OPTIMIZED) ---
const HeroSlider = ({ metrics, COLORS, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % metricsRef.current.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % metricsRef.current.length);
    }, 4000);
  };

  if (!metrics || metrics.length === 0) return null;

  const currentMetric = metrics[currentIndex];
  const nextMetric = metrics[(currentIndex + 1) % metrics.length];

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      height: 'clamp(200px, 40vh, 280px)', // Responsive height
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '24px',
      marginBottom: '24px',
      boxShadow: theme === 'dark' 
        ? '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(100, 255, 218, 0.1)'
        : '0 16px 40px rgba(0, 0, 0, 0.12), 0 0 30px rgba(13, 148, 136, 0.08)',
      border: `1px solid ${COLORS.BORDER}`,
      background: COLORS.CARD_BG,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Current metric */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(20px, 5vw, 30px)',
        opacity: 1,
        transition: 'opacity 0.5s ease-in-out',
        zIndex: 2,
      }}>
        <div style={{
          fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
          fontWeight: '800',
          color: currentMetric.color,
          textShadow: `0 0 20px ${currentMetric.color}60`,
          marginBottom: '8px',
          lineHeight: 1,
        }}>
          {currentMetric.value}
        </div>
        <div style={{
          fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
          fontWeight: '700',
          color: COLORS.TEXT_LIGHT,
          textAlign: 'center',
          maxWidth: '90%',
        }}>
          {currentMetric.label}
        </div>
      </div>

      {/* Next metric (for transition effect) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '100%',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(20px, 5vw, 30px)',
        opacity: 0,
        transition: 'opacity 0.5s ease-in-out',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
          fontWeight: '800',
          color: nextMetric.color,
          textShadow: `0 0 20px ${nextMetric.color}60`,
          marginBottom: '8px',
          lineHeight: 1,
        }}>
          {nextMetric.value}
        </div>
        <div style={{
          fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
          fontWeight: '700',
          color: COLORS.TEXT_LIGHT,
          textAlign: 'center',
          maxWidth: '90%',
        }}>
          {nextMetric.label}
        </div>
      </div>

      {/* Navigation dots */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 3,
      }}>
        {metrics.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentIndex 
                ? COLORS.ACCENT_TEAL 
                : theme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.35)' 
                  : 'rgba(0, 0, 0, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentMetric.color}15, transparent 70%)`,
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentMetric.color}08, transparent 70%)`,
        zIndex: 0,
      }} />
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const [theme, setTheme] = useTheme();
  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const [stats, setStats] = useState({
    total_cases: 0, total_diseases: 0, max_confidence: 0,
    disease_pie_chart: null, confidence_histogram: null, disease_bar_graph: null,
  });
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((res) => {
        setStats({
          total_cases: res.data.total_cases || 0,
          total_diseases: res.data.total_diseases || 0,
          max_confidence: parseFloat(res.data.max_confidence) || 0,
          disease_pie_chart: res.data.disease_pie_chart || null,
          confidence_histogram: res.data.confidence_histogram || null,
          disease_bar_graph: res.data.disease_bar_graph || null,
        });
      })
      .catch(() => setError("⚠️ Secure Data Link Interrupted"));
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const heroMetrics = [
    {
      label: "Total Patient Cases",
      value: stats.total_cases.toLocaleString(),
      color: COLORS.ACCENT_GOLD,
      icon: "📋"
    },
    {
      label: "Active Disease Classifiers",
      value: stats.total_diseases,
      color: COLORS.ACCENT_BLUE,
      icon: "🔬"
    },
    {
      label: "Maximum AI Precision",
      value: `${stats.max_confidence.toFixed(1)}%`,
      color: stats.max_confidence >= 80 ? COLORS.ACCENT_GREEN : 
             stats.max_confidence >= 50 ? COLORS.ACCENT_GOLD : 
             theme === 'dark' ? "#f87171" : "#ef4444",
      icon: "🛡️"
    }
  ];

  const dashboardStyles = {
    minHeight: "100dvh",
    background: COLORS.BG,
    padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 20px)",
    color: COLORS.TEXT_LIGHT,
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: "env(safe-area-inset-bottom, 20px)", // Safe area
  };

  const headerStyles = {
    fontSize: "clamp(1.8rem, 8vw, 2.5rem)",
    fontWeight: "900",
    background: `linear-gradient(135deg, ${COLORS.ACCENT_TEAL}, ${COLORS.ACCENT_GOLD})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
    textAlign: "center",
    letterSpacing: "-0.8px",
    textShadow: `0 2px 10px ${theme === 'dark' ? 'rgba(100, 255, 218, 0.25)' : 'rgba(13, 148, 136, 0.2)'}`,
    animation: "popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  };

  const subtitleStyle = {
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "clamp(0.8rem, 3vw, 0.92rem)",
    letterSpacing: "1.8px",
    fontWeight: 600,
    opacity: 0.9,
  };

  const statsContainerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "22px",
    width: "100%",
    maxWidth: "560px",
  };

  const sectionTitleStyle = {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: COLORS.ACCENT_TEAL,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginTop: "36px",
    marginBottom: "14px",
    width: "100%",
    textAlign: "left",
    opacity: 0.85,
    position: 'relative',
  };

  // --- REUSED COMPONENTS (OPTIMIZED FOR MOBILE) ---

  function SelectedChartModal({ chartData, onClose }) {
    if (!chartData) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: theme === 'dark' ? "rgba(1, 8, 18, 0.94)" : "rgba(240, 249, 255, 0.94)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          animation: "modalFadeIn 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: COLORS.CARD_BG,
            padding: "28px",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "700px",
            boxShadow: `
              0 20px 40px -10px rgba(0, 0, 0, 0.3),
              0 0 25px ${chartData.color}30
            `,
            position: "relative",
            border: `1px solid ${chartData.color}20`,
            backdropFilter: "blur(12px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              background: theme === 'dark' ? "rgba(8, 18, 36, 0.7)" : "rgba(240, 249, 255, 0.7)",
              color: COLORS.TEXT_MUTED,
              border: `1px solid ${theme === 'dark' ? 'rgba(100, 255, 218, 0.15)' : 'rgba(13, 148, 136, 0.15)'}`,
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            ✕
          </button>

          <h3 style={{
            color: chartData.color,
            fontSize: "clamp(1.3rem, 5vw, 1.65rem)",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: 800,
            textShadow: `0 0 10px ${chartData.color}50`
          }}>
            {chartData.icon} {chartData.title}
          </h3>

          <img
            src={`data:image/png;base64,${chartData.base64Image}`}
            alt={chartData.title}
            style={{
              width: "100%",
              borderRadius: "16px",
              border: `1px solid ${chartData.color}25`,
              boxShadow: `0 8px 16px rgba(0,0,0,0.2)`,
            }}
          />
        </div>
      </div>
    );
  }

  function HapticCard({ title, value, emoji, delay = 0, onClick }) {
    const [displayValue, setDisplayValue] = useState(0);
    const isPercent = typeof value === 'string' && value.includes('%');
    const numericValue = isPercent ? parseFloat(value) : value;

    useEffect(() => {
      if (numericValue === 0) return;
      let start = 0;
      const duration = 1200;
      const increment = numericValue / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }, [numericValue]);

    const formattedValue = isPercent 
      ? `${Math.round(displayValue)}%` 
      : Math.round(displayValue).toLocaleString();

    return (
      <div
        style={{
          background: COLORS.CARD_BG,
          backdropFilter: "blur(12px)",
          padding: "22px",
          borderRadius: "22px",
          width: "100%",
          textAlign: "center",
          border: `1px solid ${COLORS.BORDER}`,
          boxShadow: theme === 'dark' 
            ? "0 10px 28px -8px rgba(0, 0, 0, 0.65)" 
            : "0 10px 28px -8px rgba(0, 0, 0, 0.12)",
          animation: "popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          animationDelay: `${delay}s`,
          opacity: 0,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          boxSizing: "border-box",
          cursor: onClick ? "pointer" : "default",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = theme === 'dark'
              ? `0 14px 32px -10px rgba(0, 0, 0, 0.8), 0 0 12px ${COLORS.ACCENT_TEAL}25`
              : `0 14px 32px -10px rgba(0, 0, 0, 0.22), 0 0 12px ${COLORS.ACCENT_TEAL}25`;
            e.currentTarget.style.borderColor = COLORS.ACCENT_TEAL;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? "0 10px 28px -8px rgba(0, 0, 0, 0.65)"
            : "0 10px 28px -8px rgba(0, 0, 0, 0.12)";
          e.currentTarget.style.borderColor = COLORS.BORDER;
        }}
      >
        <div style={{ 
          fontSize: "clamp(1.8rem, 7vw, 2.2rem)", 
          marginBottom: "10px", 
          filter: "drop-shadow(0 0 6px rgba(100, 255, 218, 0.4))" 
        }}>
          {emoji}
        </div>
        <div style={{
          fontSize: "clamp(2.2rem, 8vw, 3rem)",
          fontWeight: "900",
          color: COLORS.ACCENT_GOLD,
          textShadow: `0 0 14px ${theme === 'dark' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(212, 175, 55, 0.4)'}`,
          lineHeight: 1,
        }}>
          {formattedValue}
        </div>
        <p style={{
          fontSize: "clamp(0.78rem, 3vw, 0.88rem)",
          color: COLORS.TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "1.6px",
          marginTop: "8px",
          fontWeight: "700",
        }}>
          {title}
        </p>
      </div>
    );
  }

  function ChartPlaceholderCard({ chartInfo, onClick, delay = 0 }) {
    const { title, icon, base64Image, color } = chartInfo;

    return (
      <div
        style={{
          background: COLORS.CARD_BG,
          backdropFilter: "blur(12px)",
          padding: "20px",
          borderRadius: "22px",
          width: "100%",
          cursor: base64Image ? "pointer" : "default",
          border: `1px solid ${color}20`,
          boxShadow: theme === 'dark'
            ? "0 12px 32px -10px rgba(0, 0, 0, 0.6)"
            : "0 12px 32px -10px rgba(0, 0, 0, 0.14)",
          animation: "popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          animationDelay: `${delay}s`,
          opacity: 0,
          transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
          boxSizing: "border-box",
        }}
        onClick={() => base64Image && onClick()}
        onMouseEnter={(e) => {
          if (base64Image) {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = `${color}50`;
            e.currentTarget.style.boxShadow = theme === 'dark'
              ? `0 18px 38px -10px rgba(0, 0, 0, 0.75), 0 0 18px ${color}25`
              : `0 18px 38px -10px rgba(0, 0, 0, 0.25), 0 0 18px ${color}25`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = `${color}20`;
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? "0 12px 32px -10px rgba(0, 0, 0, 0.6)"
            : "0 12px 32px -10px rgba(0, 0, 0, 0.14)";
        }}
      >
        <h3 style={{
          color: color,
          fontSize: "clamp(1.05rem, 4vw, 1.15rem)",
          marginBottom: "18px",
          textAlign: "center",
          fontWeight: "800",
          textShadow: `0 0 5px ${color}35`,
        }}>
          {icon} {title}
        </h3>
        {base64Image ? (
          <img
            src={`data:image/png;base64,${base64Image}`}
            style={{
              width: "100%",
              borderRadius: "12px",
              background: theme === 'dark' ? "rgba(2, 10, 20, 0.5)" : "rgba(240, 249, 255, 0.6)",
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            }}
            alt={title}
          />
        ) : (
          <div style={{
            padding: "clamp(40px, 12vw, 55px) 16px",
            color: COLORS.TEXT_MUTED,
            textAlign: "center",
            background: theme === 'dark' ? "rgba(2, 10, 20, 0.5)" : "rgba(240, 249, 255, 0.6)",
            borderRadius: "12px",
            border: `1px dashed ${theme === 'dark' ? 'rgba(100, 255, 218, 0.12)' : 'rgba(13, 148, 136, 0.25)'}`,
            fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)",
            fontWeight: 600,
            animation: "pulseGlow 1.8s infinite",
          }}>
            🧠 Neural Processing...
          </div>
        )}
      </div>
    );
  }

  function OverviewSection({ stats, title, icon, delay = 0 }) {
    let riskAssessment = { label: "Baseline", color: COLORS.TEXT_MUTED };
    if (stats.max_confidence > 0) {
      const confidence = stats.max_confidence;
      if (confidence >= 80) riskAssessment = { label: "Optimized", color: COLORS.ACCENT_GREEN };
      else if (confidence >= 50) riskAssessment = { label: "Stable", color: COLORS.ACCENT_GOLD };
      else riskAssessment = { label: "Needs Calibration", color: theme === 'dark' ? "#f87171" : "#ef4444" };
    }

    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.CARD_BG} 0%, ${theme === 'dark' ? 'rgba(6, 14, 28, 0.88)' : 'rgba(255, 255, 255, 0.9)'} 100%)`,
          backdropFilter: "blur(12px)",
          padding: "26px",
          borderRadius: "22px",
          width: "100%",
          borderLeft: `4px solid ${riskAssessment.color}`,
          boxShadow: theme === 'dark'
            ? "0 12px 32px -10px rgba(0, 0, 0, 0.6)"
            : "0 12px 32px -10px rgba(0, 0, 0, 0.14)",
          animation: "popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          animationDelay: `${delay}s`,
          opacity: 0,
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? `0 16px 38px -10px rgba(0, 0, 0, 0.75), 0 0 12px ${riskAssessment.color}20`
            : `0 16px 38px -10px rgba(0, 0, 0, 0.25), 0 0 12px ${riskAssessment.color}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? "0 12px 32px -10px rgba(0, 0, 0, 0.6)"
            : "0 12px 32px -10px rgba(0, 0, 0, 0.14)";
        }}
      >
        <h3 style={{
          color: COLORS.ACCENT_TEAL,
          fontSize: "clamp(1.15rem, 4.5vw, 1.35rem)",
          marginBottom: "20px",
          fontWeight: "800",
          textShadow: `0 0 6px ${theme === 'dark' ? 'rgba(100, 255, 218, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`
        }}>
          {icon} {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: COLORS.TEXT_MUTED, fontSize: "0.9rem", fontWeight: 600 }}>Data Points</span>
            <span style={{ fontWeight: "800", color: COLORS.TEXT_LIGHT, fontSize: "1.1rem" }}>{stats.total_cases.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: COLORS.TEXT_MUTED, fontSize: "0.9rem", fontWeight: 600 }}>Diagnostic Scopes</span>
            <span style={{ fontWeight: "800", color: COLORS.TEXT_LIGHT, fontSize: "1.1rem" }}>{stats.total_diseases}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            marginTop: "12px",
            borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
          }}>
            <span style={{ color: COLORS.TEXT_MUTED, fontSize: "0.9rem", fontWeight: 600 }}>System Reliability</span>
            <span style={{
              color: riskAssessment.color,
              fontWeight: "900",
              textTransform: "uppercase",
              fontSize: "0.82rem",
              letterSpacing: "1px",
              background: theme === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)',
              padding: '2px 8px',
              borderRadius: '5px'
            }}>
              {riskAssessment.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { title: "Symptom Distribution", icon: "🧬", base64Image: stats.disease_pie_chart, color: COLORS.ACCENT_GOLD },
    { title: "Reliability Analysis", icon: "📉", base64Image: stats.confidence_histogram, color: COLORS.ACCENT_BLUE },
    { title: "Aggregate Patient Load", icon: "🏢", base64Image: stats.disease_bar_graph, color: COLORS.ACCENT_GREEN },
  ];

  return (
    <div style={dashboardStyles}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: COLORS.CARD_BG,
          color: COLORS.TEXT_MUTED,
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.15rem',
          zIndex: 100,
          backdropFilter: 'blur(8px)',
        }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '6%',
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${COLORS.ACCENT_TEAL}08, transparent 70%)`,
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 18s infinite ease-in-out',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle, ${COLORS.ACCENT_GOLD}05, transparent 70%)`,
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 22s infinite reverse ease-in-out',
      }} />

      <style>{`
        @keyframes popIn { 
          from { opacity: 0; transform: scale(0.95) translateY(12px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes modalFadeIn { 
          from { opacity: 0; transform: scale(0.85); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 8px ${COLORS.ACCENT_TEAL}40; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
        body { 
          margin: 0; 
          background: ${theme === 'dark' ? '#010812' : '#f0f9ff'}; 
          color: ${COLORS.TEXT_LIGHT};
        }
        .section-title::after {
          content: '""';
          position: 'absolute',
          bottom: '-5px',
          left: 0,
          width: '36px',
          height: '2px',
          background: ${COLORS.ACCENT_TEAL};
          opacity: 0.6;
        }
      `}</style>

      <SelectedChartModal chartData={selectedChart} onClose={() => setSelectedChart(null)} />

      <h1 style={headerStyles}>Core Analytics</h1>
      <p style={subtitleStyle}>HEALTHCARE INTELLIGENCE v2.4</p>

      {error ? (
        <div style={{
          padding: "24px",
          color: theme === 'dark' ? "#f87171" : "#ef4444",
          background: theme === 'dark' ? "rgba(248, 113, 113, 0.08)" : "rgba(239, 68, 68, 0.08)",
          border: `1px solid ${theme === 'dark' ? 'rgba(248, 113, 113, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderRadius: "16px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: `0 0 18px ${theme === 'dark' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
        }}>
          🚨 {error}
        </div>
      ) : (
        <div style={statsContainerStyles}>
          <div style={{ ...sectionTitleStyle, marginTop: "8px" }}>Key Metrics</div>
          <HeroSlider metrics={heroMetrics} COLORS={COLORS} theme={theme} />

          <div style={{ ...sectionTitleStyle }}>Live Summary</div>
          <OverviewSection stats={stats} title="Neural Status" icon="📡" delay={0.1} />

          <div style={{ ...sectionTitleStyle }}>Metric Performance</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <HapticCard 
              title="Patient Registry" 
              value={stats.total_cases} 
              emoji="📋" 
              delay={0.25} 
              onClick={() => setSelectedChart(chartData[2])}
            />
            <HapticCard 
              title="Active Classifiers" 
              value={stats.total_diseases} 
              emoji="🔬" 
              delay={0.35} 
              onClick={() => setSelectedChart(chartData[0])}
            />
            <HapticCard 
              title="Max AI Precision" 
              value={stats.max_confidence + "%"} 
              emoji="🛡️" 
              delay={0.45} 
              onClick={() => setSelectedChart(chartData[1])}
            />
          </div>

          <div style={{ ...sectionTitleStyle }}>Data Visualization</div>
          {chartData.map((chart, index) => (
            <ChartPlaceholderCard
              key={index}
              chartInfo={chart}
              onClick={() => setSelectedChart(chart)}
              delay={0.55 + index * 0.1}
            />
          ))}
        </div>
      )}
    </div>
  );
}