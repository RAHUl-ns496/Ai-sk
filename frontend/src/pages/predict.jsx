import { useRef, useState, useEffect } from "react";
import { getDoctors } from "../services/api";

// --- COLOR PALETTES ---
const DARK_COLORS = {
  DARK_BG: '#0A192F',
  CARD_BG: 'rgba(17, 34, 64, 0.65)',
  ACCENT_TEAL: '#64FFDA',
  ACCENT_GOLD: '#FFD700',
  BORDER: '#334155',
  TEXT_LIGHT: '#E6F1FF',
  TEXT_MUTED: '#94a3b8',
  RISK_HIGH: '#FF6347',
  RISK_MED: '#FFD700',
  RISK_LOW: '#10b981',
};
const LIGHT_COLORS = {
  DARK_BG: '#ffffff',
  CARD_BG: 'rgba(255, 255, 255, 0.85)',
  ACCENT_TEAL: '#0d9488',
  ACCENT_GOLD: '#d4af37',
  BORDER: '#cbd5e1',
  TEXT_LIGHT: '#0f172a',
  TEXT_MUTED: '#64748b',
  RISK_HIGH: '#ef4444',
  RISK_MED: '#f59e0b',
  RISK_LOW: '#10b981',
};

// --- THEME MANAGER ---
const useTheme = () => {
  const [theme, _setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });
  const setTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    _setTheme(newTheme);
  };
  return [theme, setTheme];
};

// --- CIRCULAR CAUSE INDICATOR COMPONENT ---
function CauseCircle({ percentage, colors, isMobile }) {
  const size = isMobile ? 160 : 190;
  const strokeWidth = isMobile ? 10 : 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  const color =
    percentage >= 70 ? colors.RISK_LOW :
    percentage >= 30 ? colors.RISK_MED : colors.RISK_HIGH;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      margin: '0 auto'
    }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.BORDER}
          strokeWidth={strokeWidth}
          fill="none"
          opacity="0.4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
            transformOrigin: 'center',
            transform: 'rotate(0deg)'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <span style={{
          fontSize: isMobile ? '1.8rem' : '2.2rem',
          fontWeight: '800',
          color: color,
          textShadow: `0 0 10px ${color}60`
        }}>
          {Math.round(percentage)}%
        </span>
        <span style={{
          fontSize: isMobile ? '0.85rem' : '0.95rem',
          color: colors.TEXT_MUTED,
          marginTop: '4px'
        }}>
          Certainty
        </span>
      </div>
    </div>
  );
}

// --- HERO SLIDER COMPONENT ---
const HeroSlider = ({ metrics, COLORS, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % metrics.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, metrics.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (metrics.length === 0) return null;
  const currentMetric = metrics[currentIndex];
  const isMobile = window.innerWidth < 768;
  const fontSize = isMobile ? '1.8rem' : '2.4rem';
  const subFontSize = isMobile ? '1.1rem' : '1.4rem';

  return (
    <div style={{
      width: '100%',
      height: isMobile ? '180px' : '220px',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      marginBottom: '24px',
      ...(!isMobile && {
        boxShadow: theme === 'dark'
          ? '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 30px rgba(100, 255, 218, 0.1)'
          : '0 15px 35px rgba(0, 0, 0, 0.15), 0 0 30px rgba(13, 148, 136, 0.1)',
      }),
      border: `1px solid ${COLORS.BORDER}`,
      background: COLORS.CARD_BG,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px' : '30px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '100%',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '10px',
        }}>
          <span style={{
            fontSize: isMobile ? '2.2rem' : '2.8rem',
            color: currentMetric.color,
            textShadow: `0 0 15px ${currentMetric.color}50`,
          }}>
            {currentMetric.icon}
          </span>
          <div style={{
            fontSize,
            fontWeight: '800',
            color: currentMetric.color,
            textShadow: `0 0 15px ${currentMetric.color}50`,
            lineHeight: 1,
          }}>
            {currentMetric.value}
          </div>
        </div>
        <div style={{
          fontSize: subFontSize,
          fontWeight: '700',
          color: COLORS.TEXT_LIGHT,
          textAlign: 'center',
          maxWidth: '90%',
        }}>
          {currentMetric.label}
        </div>
      </div>
      {metrics.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '12px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
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
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        width: isMobile ? '50px' : '60px',
        height: isMobile ? '50px' : '60px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentMetric.color}20, transparent 70%)`,
        zIndex: 0,
      }} />
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Predict() {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [theme, setTheme] = useTheme();
  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const [fileInput, setFileInput] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [diseaseConfig, setDiseaseConfig] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' = front, 'environment' = back

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/config/disease-info`);
        if (res.ok) setDiseaseConfig(await res.json());
      } catch {
        console.warn("Could not fetch disease config.");
      }
    };
    fetchConfig();
  }, [API_BASE]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Revoke preview URL
  useEffect(() => {
    if (fileInput) {
      const url = URL.createObjectURL(fileInput);
      setPreviewURL(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileInput]);

  // ✅ CRITICAL: Restart camera when facingMode changes AND camera is active
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("⚠ Camera not supported.");
      setCameraActive(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
      setErrorMsg(null);
      setFileInput(null);
      setResult(null);
      setDoctors([]);
    } catch (err) {
      console.error("Camera error:", err);
      let msg = "⚠ Camera access failed.";
      if (err.name === "NotAllowedError") {
        msg = "⚠ Please allow camera access in browser settings.";
      } else if (err.name === "OverconstrainedError") {
        // Fallback if exact facingMode not available
        try {
          const fallbackConstraints = {
            video: { facingMode: facingMode, width: { ideal: 640 } },
            audio: false
          };
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          setStream(fallbackStream);
          setCameraActive(true);
          setErrorMsg(null);
        } catch (fallbackErr) {
          msg = "⚠ No camera found with requested mode.";
          setCameraActive(false);
        }
      } else if (err.name === "NotFoundError") {
        msg = "⚠ No camera detected on this device.";
        setCameraActive(false);
      }
      setErrorMsg(msg);
    }
  };

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const file = dataURLtoFile(dataUrl, 'captured-lesion.jpg');
    
    setFileInput(file);
    setPreviewURL(dataUrl);
    setCameraActive(false);
    
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const resetAll = () => {
    setFileInput(null);
    setPreviewURL(null);
    setPatientName("");
    setResult(null);
    setDoctors([]);
    setErrorMsg(null);
    setCameraActive(false);
    setFacingMode('environment');
    if (fileRef.current) fileRef.current.value = "";
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const sendForPrediction = async () => {
    if (!patientName.trim()) return setErrorMsg("⚠ Enter patient name");
    if (!fileInput) return setErrorMsg("⚠ Upload or capture an image");
    setErrorMsg(null);
    setLoading(true);
    setResult(null);
    setDoctors([]);

    try {
      const form = new FormData();
      form.append("file", fileInput);
      form.append("patient_name", patientName);
      const res = await fetch(`${API_BASE}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const key = Object.keys(diseaseConfig).find(k => diseaseConfig[k].name === data.class) || data.class;
      const info = diseaseConfig[key] || {};
      setResult({
        class: data.class,
        confidence: data.confidence || 0,
        description: data.description || "Description unavailable.",
        recommendation: data.recommendation || "Recommendation unavailable.",
        heatmapBase64: data.heatmap_base64 || null,
        severity: info.severity,
        characteristics: info.characteristics,
        common_treatment: info.common_treatment,
        risk_factors: info.risk_factors,
      });
      const docRes = await getDoctors(data.class);
      if (docRes?.data?.doctors) setDoctors(docRes.data.doctors);
    } catch (err) {
      setErrorMsg(`❌ Prediction failed: ${err.message || 'Check server.'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const UI = {
    page: {
      background: theme === 'dark'
        ? `radial-gradient(circle at 20% 30%, ${COLORS.ACCENT_TEAL}08, transparent 25%),
           radial-gradient(circle at 80% 70%, ${COLORS.ACCENT_GOLD}08, ${COLORS.DARK_BG} 35%)`
        : `radial-gradient(circle at 20% 30%, ${COLORS.ACCENT_TEAL}08, transparent 25%),
           radial-gradient(circle at 80% 70%, ${COLORS.ACCENT_GOLD}06, ${COLORS.DARK_BG} 35%)`,
      minHeight: '100vh',
      padding: isMobile ? '15px' : '30px 15px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      color: COLORS.TEXT_LIGHT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
      color: COLORS.ACCENT_TEAL,
      marginBottom: isMobile ? '20px' : '35px',
      fontSize: isMobile ? '1.8rem' : '2.4rem',
      fontWeight: 800,
      textShadow: theme === 'dark'
        ? `0 0 12px ${COLORS.ACCENT_TEAL}90`
        : `0 0 8px ${COLORS.ACCENT_TEAL}60`,
      letterSpacing: '0.5px',
    },
    grid: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'column',
      gap: isMobile ? '20px' : '28px',
      width: '100%',
      maxWidth: isMobile ? '100%' : '900px',
    },
    cardBase: {
      background: COLORS.CARD_BG,
      borderRadius: '16px',
      padding: isMobile ? '20px' : '28px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: theme === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: theme === 'dark'
        ? '0 10px 30px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: isMobile ? '12px 14px' : '13px 16px',
      marginBottom: '20px',
      background: theme === 'dark' ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 250, 252, 0.8)',
      border: `2px solid ${COLORS.BORDER}`,
      borderRadius: '10px',
      color: COLORS.TEXT_LIGHT,
      fontSize: isMobile ? '1rem' : '1.02rem',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    fileInputLabel: {
      display: 'inline-block',
      padding: isMobile ? '12px 0' : '13px 0',
      borderRadius: '10px',
      textAlign: 'center',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      flex: 1,
      fontSize: isMobile ? '0.9rem' : '1rem',
    },
    preview: {
      width: '100%',
      borderRadius: '14px',
      border: `2px solid ${COLORS.ACCENT_TEAL}`,
      boxShadow: `0 0 14px ${COLORS.ACCENT_TEAL}70`,
      marginTop: '20px',
      aspectRatio: '4/3',
      objectFit: 'cover',
      position: 'relative',
    },
    previewOverlay: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      background: COLORS.ACCENT_TEAL,
      color: theme === 'dark' ? DARK_COLORS.DARK_BG : LIGHT_COLORS.DARK_BG,
      padding: isMobile ? '4px 12px' : '5px 14px',
      borderRadius: '30px',
      fontSize: isMobile ? '0.75rem' : '0.82rem',
      fontWeight: '800',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    },
    resultCard: {
      background: theme === 'dark' ? 'rgba(10, 25, 47, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: `1px solid ${COLORS.ACCENT_GOLD}50`,
      borderRadius: '14px',
      padding: isMobile ? '18px' : '22px',
      marginTop: '24px',
      backdropFilter: 'blur(10px)',
    },
    severityBadge: (severity) => {
      let color;
      if (severity >= 4) color = COLORS.RISK_HIGH;
      else if (severity >= 2) color = COLORS.RISK_MED;
      else color = COLORS.RISK_LOW;
      return {
        marginLeft: '12px',
        padding: isMobile ? '5px 14px' : '6px 18px',
        background: color,
        color: theme === 'dark' ? DARK_COLORS.DARK_BG : LIGHT_COLORS.DARK_BG,
        borderRadius: '30px',
        fontSize: isMobile ? '0.8rem' : '0.88rem',
        fontWeight: '800',
        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), 0 0 8px ${color}80`,
      };
    },
    doctorCard: {
      background: theme === 'dark' ? 'rgba(10, 25, 47, 0.6)' : 'rgba(248, 250, 252, 0.8)',
      border: `1px solid ${COLORS.ACCENT_TEAL}60`,
      borderRadius: '12px',
      padding: isMobile ? '14px' : '18px',
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
      backdropFilter: 'blur(8px)',
      marginBottom: isMobile ? '10px' : '0',
    },
  };

  const heroMetrics = [
    {
      label: "AI Confidence Level",
      value: result ? `${result.confidence.toFixed(1)}%` : "0%",
      color: result
        ? (result.confidence >= 70 ? COLORS.RISK_LOW :
           result.confidence >= 30 ? COLORS.RISK_MED : COLORS.RISK_HIGH)
        : COLORS.TEXT_MUTED,
      icon: "🎯"
    },
    {
      label: "Patient Cases Analyzed",
      value: doctors.length > 0 ? doctors.length : "0",
      color: COLORS.ACCENT_GOLD,
      icon: "👨‍⚕️"
    },
    {
      label: "Diagnosis Severity",
      value: result ? `Level ${result.severity || 0}/5` : "N/A",
      color: result
        ? (result.severity >= 4 ? COLORS.RISK_HIGH :
           result.severity >= 2 ? COLORS.RISK_MED : COLORS.RISK_LOW)
        : COLORS.TEXT_MUTED,
      icon: "⚠️"
    }
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const HapticButton = ({ children, onClick, style, disabled, active = false }) => {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{
          ...style,
          transform: isPressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.1s ease, box-shadow 0.2s ease',
          ...(active && !isPressed && {
            boxShadow: `0 0 15px ${COLORS.ACCENT_TEAL}80`,
            border: `1px solid ${COLORS.ACCENT_TEAL}`
          })
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={UI.page}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          background: COLORS.CARD_BG,
          color: COLORS.TEXT_MUTED,
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: '50%',
          width: isMobile ? '38px' : '44px',
          height: isMobile ? '38px' : '44px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '1rem' : '1.2rem',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: theme === 'dark'
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.08)',
        }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <h1 style={UI.title}>🧠 AI Dermatological Analyzer</h1>

      {result && <HeroSlider metrics={heroMetrics} COLORS={COLORS} theme={theme} />}

      <div style={UI.grid}>
        {/* PATIENT ADMISSION */}
        <div style={UI.cardBase}>
          <h2 style={{
            color: COLORS.ACCENT_TEAL,
            fontSize: isMobile ? '1.3rem' : '1.55rem',
            fontWeight: 800,
            marginBottom: '22px',
            textShadow: theme === 'dark'
              ? `0 0 8px ${COLORS.ACCENT_TEAL}80`
              : `0 0 6px ${COLORS.ACCENT_TEAL}60`,
          }}>
            📁 Patient Admission
          </h2>
          <input
            placeholder="Patient Full Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            style={UI.input}
          />
          <div style={{
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            marginBottom: '22px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <HapticButton
              onClick={() => fileRef.current?.click()}
              style={{
                ...UI.fileInputLabel,
                background: cameraActive ? 'rgba(51, 65, 85, 0.3)' : 'rgba(51, 65, 85, 0.7)',
                color: cameraActive ? COLORS.TEXT_MUTED : COLORS.TEXT_LIGHT,
                border: `1px solid ${COLORS.ACCENT_TEAL}90`,
              }}
              disabled={cameraActive}
            >
              📂 Upload
            </HapticButton>
            <HapticButton
              onClick={startCamera}
              style={{
                ...UI.fileInputLabel,
                background: cameraActive ? 'rgba(51, 65, 85, 0.7)' : 'rgba(51, 65, 85, 0.3)',
                color: cameraActive ? COLORS.ACCENT_GOLD : COLORS.TEXT_MUTED,
                border: `1px solid ${COLORS.ACCENT_GOLD}90`,
              }}
              disabled={cameraActive}
              active={!cameraActive}
            >
              📸 Camera
            </HapticButton>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && setFileInput(e.target.files[0])}
            style={{ display: "none" }}
            id="file-upload"
            ref={fileRef}
            disabled={cameraActive}
          />

          {cameraActive && (
            <div style={{
              position: 'relative',
              marginTop: '20px',
              borderRadius: '14px',
              overflow: 'hidden',
              ...(isMobile && {
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })
            }}>
              {/* ✅ CAMERA TOGGLE BUTTON — NOW WORKS! */}
              <button
                onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: COLORS.CARD_BG,
                  color: COLORS.TEXT_LIGHT,
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '12px',
                  padding: isMobile ? '6px 10px' : '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  zIndex: 9,
                  backdropFilter: 'blur(6px)',
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  fontWeight: '700',
                  boxShadow: theme === 'dark'
                    ? '0 2px 6px rgba(0,0,0,0.4)'
                    : '0 2px 6px rgba(0,0,0,0.1)',
                }}
                aria-label={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
              >
                {facingMode === 'user' ? '📷 Back' : '🤳 Front'}
              </button>

              <video ref={videoRef} autoPlay playsInline muted style={{
                width: '100%',
                display: 'block',
                aspectRatio: '4/3',
                background: theme === 'dark' ? '#000' : '#f8fafc',
                ...(isMobile && {
                  maxHeight: '100%',
                  objectFit: 'cover'
                })
              }} />
              <button
                onClick={captureImage}
                style={{
                  position: 'absolute',
                  bottom: isMobile ? '10px' : '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isMobile ? '54px' : '64px',
                  height: isMobile ? '54px' : '64px',
                  borderRadius: '50%',
                  background: '#fff',
                  border: isMobile ? '3px solid #f00' : '4px solid #f00',
                  boxShadow: '0 0 14px rgba(255,0,0,0.7)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '22px' : '26px',
                  color: '#f00',
                  fontWeight: 'bold',
                  zIndex: 10,
                }}
              >
                ●
              </button>
            </div>
          )}

          <HapticButton
            onClick={resetAll}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              background: COLORS.RISK_HIGH,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '18px',
              boxShadow: `0 4px 10px ${COLORS.RISK_HIGH}60`,
            }}
          >
            🔄 Reset All
          </HapticButton>
        </div>

        {/* ANALYTICAL OUTPUT */}
        <div style={UI.cardBase}>
          <h2 style={{
            color: COLORS.ACCENT_GOLD,
            fontSize: isMobile ? '1.3rem' : '1.55rem',
            fontWeight: 800,
            marginBottom: '22px',
            textShadow: theme === 'dark'
              ? `0 0 8px ${COLORS.ACCENT_GOLD}80`
              : `0 0 6px ${COLORS.ACCENT_GOLD}60`,
          }}>
            🔬 Analytical Output
          </h2>

          <HapticButton
            onClick={sendForPrediction}
            disabled={loading || !patientName.trim() || !fileInput}
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '13px',
              background: COLORS.ACCENT_GOLD,
              color: theme === 'dark' ? DARK_COLORS.DARK_BG : LIGHT_COLORS.DARK_BG,
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${COLORS.ACCENT_GOLD}80`,
              opacity: loading || !patientName.trim() || !fileInput ? 0.65 : 1,
            }}
          >
            {loading ? "✨ Analyzing..." : "🚀 Run AI Diagnosis"}
          </HapticButton>

          {errorMsg && (
            <p style={{
              color: COLORS.RISK_HIGH,
              padding: isMobile ? "10px" : "12px",
              borderRadius: "10px",
              marginTop: "20px",
              fontSize: isMobile ? "0.85rem" : "0.92rem",
              background: theme === 'dark'
                ? "rgba(255, 99, 71, 0.08)"
                : "rgba(239, 68, 68, 0.08)",
              border: `1px dashed ${COLORS.RISK_HIGH}80`,
            }}>
              {errorMsg}
            </p>
          )}

          {previewURL && !cameraActive && (
            <div style={{
              position: "relative",
              marginTop: "22px",
              ...(isMobile && { overflow: 'hidden' })
            }}>
              <img
                src={previewURL}
                alt="Preview"
                style={{
                  ...UI.preview,
                  ...(isMobile && {
                    borderRadius: '10px',
                    maxHeight: '300px',
                    objectFit: 'cover'
                  })
                }}
              />
              <div style={UI.previewOverlay}>INPUT SOURCE</div>
            </div>
          )}

          {result && (
            <div style={{
              textAlign: 'center',
              marginTop: '22px',
              ...(isMobile && { padding: '0 10px' })
            }}>
              <h4 style={{
                color: COLORS.ACCENT_TEAL,
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                Likelihood of Diagnosis
              </h4>
              <CauseCircle percentage={result.confidence} colors={COLORS} isMobile={isMobile} />
              <p style={{
                color: COLORS.ACCENT_GOLD,
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.12rem',
                marginTop: '12px'
              }}>
                {result.class}
              </p>
            </div>
          )}

          {result && (
            <div style={UI.resultCard}>
              <h3 style={{
                color: COLORS.ACCENT_GOLD,
                fontSize: isMobile ? "1.2rem" : "1.35rem",
                fontWeight: 700,
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                ✅ DIAGNOSIS: {result.class}
                {result.severity && (
                  <span style={UI.severityBadge(result.severity)}>
                    Severity: {result.severity}/5
                  </span>
                )}
              </h3>
              <h4 style={{
                color: COLORS.ACCENT_TEAL,
                marginTop: "20px",
                fontWeight: 700,
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>🩺 Clinical Overview:</h4>
              <p style={{
                fontSize: isMobile ? "0.92rem" : "0.98rem",
                lineHeight: 1.6,
                color: COLORS.TEXT_LIGHT,
                marginBottom: isMobile ? '15px' : '0'
              }}>{result.description}</p>
              {result.characteristics && (
                <>
                  <h4 style={{
                    color: COLORS.ACCENT_TEAL,
                    marginTop: "18px",
                    fontWeight: 700,
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>🔬 Key Characteristics:</h4>
                  <p style={{
                    fontSize: isMobile ? "0.88rem" : "0.94rem",
                    color: COLORS.TEXT_MUTED,
                    lineHeight: 1.6,
                    marginBottom: isMobile ? '15px' : '0'
                  }}>
                    {result.characteristics}
                  </p>
                </>
              )}
              {result.common_treatment && (
                <>
                  <h4 style={{
                    color: COLORS.ACCENT_TEAL,
                    marginTop: "18px",
                    fontWeight: 700,
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>💊 Common Treatment:</h4>
                  <p style={{
                    fontSize: isMobile ? "0.88rem" : "0.94rem",
                    color: COLORS.TEXT_MUTED,
                    lineHeight: 1.6,
                    marginBottom: isMobile ? '15px' : '0'
                  }}>
                    {result.common_treatment}
                  </p>
                </>
              )}
              {result.risk_factors && (
                <>
                  <h4 style={{
                    color: COLORS.ACCENT_TEAL,
                    marginTop: "18px",
                    fontWeight: 700,
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>⚠️ Risk Factors:</h4>
                  <p style={{
                    fontSize: isMobile ? "0.88rem" : "0.94rem",
                    color: COLORS.TEXT_MUTED,
                    lineHeight: 1.6,
                    marginBottom: isMobile ? '15px' : '0'
                  }}>
                    {result.risk_factors}
                  </p>
                </>
              )}
              <p style={{
                marginTop: "24px",
                color: COLORS.ACCENT_GOLD,
                fontWeight: "800",
                fontSize: isMobile ? "1rem" : "1.08rem",
                borderTop: `1px dashed ${COLORS.BORDER}`,
                paddingTop: "14px"
              }}>
                📋 Clinical Protocol: {result.recommendation}
              </p>
            </div>
          )}

          {result?.heatmapBase64 && (
            <div style={{ marginTop: "24px" }}>
              <img
                src={`data:image/jpeg;base64,${result.heatmapBase64}`}
                alt="Heatmap"
                style={{
                  ...UI.preview,
                  border: `2px solid ${COLORS.ACCENT_GOLD}`,
                  ...(isMobile && {
                    borderRadius: '10px',
                    maxHeight: '300px',
                    objectFit: 'cover'
                  })
                }}
              />
              <p style={{
                textAlign: "center",
                color: COLORS.TEXT_MUTED,
                fontSize: isMobile ? "0.8rem" : "0.85rem",
                marginTop: "10px"
              }}>
                AI Attention Map (Grad-CAM)
              </p>
            </div>
          )}

          {doctors.length > 0 && (
            <div style={{ marginTop: "28px" }}>
              <h2 style={{
                color: COLORS.ACCENT_GOLD,
                fontSize: isMobile ? "1.25rem" : "1.45rem",
                fontWeight: 800,
                marginBottom: "18px",
                textShadow: theme === 'dark'
                  ? `0 0 6px ${COLORS.ACCENT_GOLD}70`
                  : `0 0 4px ${COLORS.ACCENT_GOLD}50`,
              }}>
                👨‍⚕️ Recommended Specialists
              </h2>
              {doctors.map((doc, i) => (
                <div
                  key={i}
                  style={UI.doctorCard}
                  onClick={() => window.location.href = `tel:${doc.contact}`}
                  onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <h3 style={{
                    color: COLORS.ACCENT_TEAL,
                    marginBottom: "8px",
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>{doc.name}</h3>
                  <p style={{
                    lineHeight: isMobile ? 1.4 : 1.6,
                    color: COLORS.TEXT_LIGHT,
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}><b>Specialty:</b> {doc.specialist}</p>
                  <p style={{
                    lineHeight: isMobile ? 1.4 : 1.6,
                    color: COLORS.TEXT_LIGHT,
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}><b>Hospital:</b> {doc.hospital}</p>
                  <p style={{
                    lineHeight: isMobile ? 1.4 : 1.6,
                    color: COLORS.TEXT_LIGHT,
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}><b>City:</b> {doc.city}</p>
                  <p style={{
                    lineHeight: isMobile ? 1.4 : 1.6,
                    color: COLORS.TEXT_LIGHT,
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}>
                    <b>Contact:</b> <a
                      href={`tel:${doc.contact}`}
                      style={{
                        color: COLORS.ACCENT_TEAL,
                        textDecoration: "none",
                        fontWeight: 'bold'
                      }}
                    >
                      {doc.contact}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        input:focus {
          outline: none;
          border-color: ${COLORS.ACCENT_TEAL};
          box-shadow: 0 0 10px ${COLORS.ACCENT_TEAL}90;
        }
        body {
          margin: 0;
          background: ${theme === 'dark' ? DARK_COLORS.DARK_BG : LIGHT_COLORS.DARK_BG};
          color: ${COLORS.TEXT_LIGHT};
          overscroll-behavior: contain;
        }
        @media (max-width: 768px) {
          div[style*="font-size:"] {
            font-size: max(0.8rem, 4vw) !important;
          }
        }
      `}</style>
    </div>
  );
}