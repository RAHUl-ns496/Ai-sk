import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

/**
 * --- DATA CONSTANTS ---
 */
const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

/**
 * --- DESIGN SYSTEM (refined for deeper, more premium feel) ---
 */
const COLORS = {
  BG: 'radial-gradient(circle at 20% 80%, rgba(100, 255, 218, 0.06) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.06) 0%, transparent 40%), #00040f',
  CARD_BG: 'rgba(8, 18, 38, 0.82)',
  BORDER: 'rgba(100, 255, 218, 0.18)',
  ACCENT_TEAL: '#64FFDA',
  ACCENT_GOLD: '#FFD700',
  TEXT_LIGHT: '#E6F1FF',
  TEXT_MUTED: '#8892B0',
  RISK_HIGH: '#FF6347',
  SUCCESS: '#10B981',
  GLASS_GLOW: 'rgba(100, 255, 218, 0.08)',
};

/**
 * --- AUTH PAGE COMPONENT (enhanced visuals) ---
 */
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGrp, setBloodGrp] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [activeField, setActiveField] = useState(null);
  const [buttonPressed, setButtonPressed] = useState(false);

  const clearForm = useCallback(() => {
    setName(""); setPhone(""); setAddress(""); setAge(""); setGender("");
    setBloodGrp(""); setPinCode(""); setDistrict(""); setState("");
    setEmail(""); setPassword("");
    setError(null);
    setShowSuccessModal(false);
    setCurrentStep(1);
    setActiveField(null);
  }, []);

  const handleLogin = useCallback(async () => {
    setError(null);
    setLoading(true);
    setButtonPressed(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError("❌ " + error.message);
        setLoading(false);
      } else {
        setShowSuccessModal(true);
        // Navigation handled by App.jsx useEffect or manual fallback
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch (err) {
      setError("❌ An unexpected error occurred.");
      setLoading(false);
    } finally {
      setButtonPressed(false);
    }
  }, [email, password, navigate]);

  const handleRegister = useCallback(async () => {
    setError(null);
    setButtonPressed(true);

    if (!name || !phone || !email || !password || !state) {
      setError("❌ Required: Please complete Name, Phone, Email, Password, and State.");
      setButtonPressed(false);
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: "",
            phone: phone,
            state: state,
            // Add other fields if needed for meta_data or profile updates later
          },
        },
      });

      if (error) {
        setError("❌ " + error.message);
        setLoading(false);
      } else {
        setShowSuccessModal(true);
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      setError("❌ An unexpected error occurred during registration.");
      setLoading(false);
    } finally {
      setButtonPressed(false);
    }
  }, [name, phone, email, password, state, navigate]);

  useEffect(() => {
    clearForm();
  }, [isLogin, clearForm]);

  const triggerHaptic = useCallback((intensity = 'light') => {
    if (window.navigator.vibrate) {
      const pattern = intensity === 'heavy' ? [30] : [10];
      window.navigator.vibrate(pattern);
    }
  }, []);

  /**
   * --- MOBILE-OPTIMIZED STYLING (refined spacing, glows, and depth) ---
   */
  const UI = {
    wrapper: {
      minHeight: "100dvh",
      background: COLORS.BG,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
      paddingTop: "max(env(safe-area-inset-top), 40px)",
      paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    brandSection: {
      textAlign: "center",
      marginBottom: "clamp(20px, 5vh, 40px)",
      padding: "0 20px",
      animation: "float 8s ease-in-out infinite",
    },
    mainCard: {
      width: "100%",
      maxWidth: "480px",
      margin: "0 16px",
      background: COLORS.CARD_BG,
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      borderRadius: "32px",
      padding: "clamp(32px, 8vw, 48px) clamp(28px, 7vw, 40px)",
      border: `1px solid ${COLORS.BORDER}`,
      boxShadow: "0 30px 90px rgba(0,0,0,0.6), inset 0 0 40px rgba(100, 255, 218, 0.1)",
      position: "relative",
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
    },
    tabBar: {
      display: "flex",
      background: "rgba(0, 5, 15, 0.6)",
      borderRadius: "24px",
      padding: "8px",
      marginBottom: "clamp(20px, 5vh, 32px)",
      border: "1px solid rgba(100, 255, 218, 0.1)",
      overflow: "hidden",
    },
    tabButton: (active) => ({
      flex: 1,
      padding: "18px 14px",
      borderRadius: "20px",
      textAlign: "center",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "1.05rem",
      minHeight: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      background: active ? COLORS.ACCENT_TEAL : "transparent",
      color: active ? "#020c1b" : COLORS.TEXT_MUTED,
      boxShadow: active ? `0 10px 30px rgba(100, 255, 218, 0.35)` : "none",
    }),
    inputContainer: {
      marginBottom: "clamp(16px, 4vh, 24px)",
    },
    inputLabel: {
      fontSize: "0.85rem",
      color: COLORS.ACCENT_TEAL,
      fontWeight: 800,
      marginBottom: "12px",
      display: "block",
      textTransform: "uppercase",
      letterSpacing: "1.6px",
      paddingLeft: "4px",
    },
    field: {
      width: "100%",
      padding: "20px 22px",
      background: "rgba(2, 12, 27, 0.8)",
      border: "1px solid rgba(100, 255, 218, 0.18)",
      borderRadius: "20px",
      color: COLORS.TEXT_LIGHT,
      fontSize: "1.1rem",
      outline: "none",
      transition: "all 0.4s ease",
      boxSizing: "border-box",
      minHeight: "62px",
      WebkitAppearance: "none",
    },
    fieldActive: {
      border: `2px solid ${COLORS.ACCENT_TEAL}`,
      background: "rgba(2, 12, 27, 0.95)",
      boxShadow: "0 0 30px rgba(100, 255, 218, 0.25)",
    },
    primaryAction: {
      width: "100%",
      padding: "22px",
      background: `linear-gradient(135deg, ${COLORS.ACCENT_TEAL}, ${COLORS.ACCENT_GOLD})`,
      border: "none",
      borderRadius: "28px",
      color: "#020c1b",
      fontWeight: 900,
      fontSize: "1.2rem",
      letterSpacing: "0.8px",
      cursor: "pointer",
      marginTop: "clamp(20px, 5vh, 32px)",
      boxShadow: `0 15px 40px rgba(100, 255, 218, 0.35)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      minHeight: "68px",
      transition: "all 0.3s ease",
    },
    primaryActionPressed: {
      transform: "scale(0.96)",
      boxShadow: `0 8px 25px rgba(100, 255, 218, 0.45)`,
    },
    secondaryAction: {
      width: "100%",
      padding: "20px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "24px",
      color: COLORS.TEXT_LIGHT,
      fontWeight: 700,
      fontSize: "1.05rem",
      cursor: "pointer",
      minHeight: "62px",
      transition: "all 0.3s ease",
    },
    secondaryActionPressed: {
      transform: "scale(0.97)",
      background: "rgba(255,255,255,0.15)",
    },
    footer: {
      marginTop: "auto",
      paddingTop: "clamp(30px, 6vh, 50px)",
      textAlign: "center",
      color: COLORS.TEXT_MUTED,
      fontSize: "0.9rem",
      width: "100%",
      padding: "0 20px",
    },
    toggleArea: {
      marginTop: "clamp(24px, 5vh, 36px)",
      textAlign: "center",
      paddingTop: "clamp(20px, 4vh, 28px)",
      borderTop: "1px solid rgba(100,255,218,0.15)",
    }
  };

  // Prevent zoom on input focus (iOS)
  useEffect(() => {
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    }
  }, []);

  // Better keyboard handling
  useEffect(() => {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(() => window.scrollTo(0, 0), 300);
      });
    });
  }, [isLogin, currentStep]);

  return (
    <div style={UI.wrapper}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0.5); } 70% { box-shadow: 0 0 0 15px rgba(100, 255, 218, 0); } 100% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0); } }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScale { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 125%; }
        }

        * { -webkit-tap-highlight-color: transparent; }
        input, select { -webkit-appearance: none; border-radius: 20px; }

        .field-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%2364FFDA' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 20px center;
          background-size: 24px;
        }

        .primary-action {
          position: relative;
          overflow: hidden;
        }
        .primary-action::after {
          content: '';
          position: absolute;
          top: -50%;
          height: 200%;
          width: 60%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          left: -100%;
          animation: shine 5s ease-in-out infinite;
          pointer-events: none;
        }

        .toggle-link {
          position: relative;
          display: inline-block;
          transition: color 0.4s ease;
        }
        .toggle-link:hover {
          color: ${COLORS.ACCENT_GOLD};
        }
        .toggle-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 0;
          height: 3px;
          background: linear-gradient(to right, transparent, ${COLORS.ACCENT_GOLD}, transparent);
          transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 2px;
        }
        .toggle-link:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Enhanced Background Orbs */}
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(100, 255, 218, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(100, 255, 218, 0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Hero */}
      <div style={UI.brandSection}>
        <div style={{ fontSize: "5rem", filter: "drop-shadow(0 0 30px rgba(100, 255, 218, 0.6))" }}>
          {isLogin ? "⚕️" : "🩺"}
        </div>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 900,
          background: `linear-gradient(135deg, ${COLORS.ACCENT_TEAL}, ${COLORS.ACCENT_GOLD})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "16px 0 10px"
        }}>
          {isLogin ? "DermAI Portal" : "Practitioner Enrollment"}
        </h1>
        <p style={{ color: COLORS.TEXT_MUTED, fontSize: "1.1rem", lineHeight: "1.6" }}>
          {isLogin ? "Encrypted Clinical Gateway" : "Professional Credentialing System"}
        </p>
      </div>

      <div style={UI.mainCard}>
        {/* Tabs */}
        <div style={UI.tabBar}>
          <div style={UI.tabButton(isLogin)} onClick={() => { setIsLogin(true); triggerHaptic('heavy'); }}>
            🔐 Secure Login
          </div>
          <div style={UI.tabButton(!isLogin)} onClick={() => { setIsLogin(false); triggerHaptic('heavy'); }}>
            ✨ Join Network
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "20px", background: "rgba(255, 99, 71, 0.15)", border: `1px solid ${COLORS.RISK_HIGH}55`, borderRadius: "24px", color: COLORS.RISK_HIGH, marginBottom: "24px", fontSize: "1.05rem", fontWeight: 600, animation: "pulse 0.6s ease" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form Wrapper */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isLogin ? 'center' : 'flex-start'
        }}>
          {isLogin ? (
            <div style={{ animation: "slideIn 0.5s ease-out", width: '100%' }}>
              <div style={UI.inputContainer}>
                <label style={UI.inputLabel}>🩺 Doctor ID / Email</label>
                <input style={{ ...UI.field, ...(activeField === 'email' ? UI.fieldActive : {}) }} placeholder="doctor@hospital.org" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)} />
              </div>
              <div style={UI.inputContainer}>
                <label style={UI.inputLabel}>🔐 Private Access Key</label>
                <input style={{ ...UI.field, ...(activeField === 'password' ? UI.fieldActive : {}) }} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setActiveField('password')} onBlur={() => setActiveField(null)} />
              </div>
              <button className="primary-action" style={{ ...UI.primaryAction, ...(buttonPressed ? UI.primaryActionPressed : {}) }} onClick={handleLogin} disabled={loading}>
                {loading ? "🔄 AUTHENTICATING..." : "🔓 ACCESS DASHBOARD"}
              </button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {/* Enhanced Progress Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: "clamp(28px, 6vh, 40px)" }}>
                <div style={{ display: "flex", alignItems: "center", width: "80%", maxWidth: "340px", justifyContent: "space-between" }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: currentStep >= 1 ? COLORS.ACCENT_TEAL : "rgba(100, 255, 218, 0.25)",
                    boxShadow: currentStep === 1 ? "0 0 25px rgba(100, 255, 218, 0.7)" : currentStep > 1 ? "0 0 15px rgba(100, 255, 218, 0.3)" : "none",
                    transition: "all 0.5s ease"
                  }} />
                  <div style={{ flex: 1, height: "4px", background: currentStep > 1 ? COLORS.ACCENT_TEAL : COLORS.GLASS_GLOW, transition: "background 0.6s ease", borderRadius: "2px" }} />
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: currentStep >= 2 ? COLORS.ACCENT_TEAL : "rgba(100, 255, 218, 0.25)",
                    boxShadow: currentStep === 2 ? "0 0 25px rgba(100, 255, 218, 0.7)" : currentStep > 2 ? "0 0 15px rgba(100, 255, 218, 0.3)" : "none",
                    transition: "all 0.5s ease"
                  }} />
                  <div style={{ flex: 1, height: "4px", background: currentStep > 2 ? COLORS.ACCENT_TEAL : COLORS.GLASS_GLOW, transition: "background 0.6s ease", borderRadius: "2px" }} />
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: currentStep >= 3 ? COLORS.ACCENT_TEAL : "rgba(100, 255, 218, 0.25)",
                    boxShadow: currentStep === 3 ? "0 0 25px rgba(100, 255, 218, 0.7)" : "none",
                    transition: "all 0.5s ease"
                  }} />
                </div>
              </div>

              {currentStep === 1 && (
                <div style={{ animation: "slideIn 0.4s" }}>
                  <div style={UI.inputContainer}><label style={UI.inputLabel}>👤 Legal Name</label><input style={{ ...UI.field, ...(activeField === 'name' ? UI.fieldActive : {}) }} placeholder="Dr. Alexander Wright" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setActiveField('name')} onBlur={() => setActiveField(null)} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>📱 Mobile</label><input style={{ ...UI.field, ...(activeField === 'phone' ? UI.fieldActive : {}) }} placeholder="+91..." value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={() => setActiveField('phone')} onBlur={() => setActiveField(null)} /></div>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>📧 Official Email</label><input style={{ ...UI.field, ...(activeField === 'regEmail' ? UI.fieldActive : {}) }} placeholder="alex@med.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setActiveField('regEmail')} onBlur={() => setActiveField(null)} /></div>
                  </div>
                  <div style={UI.inputContainer}><label style={UI.inputLabel}>🔑 Set Access Key</label><input style={{ ...UI.field, ...(activeField === 'regPass' ? UI.fieldActive : {}) }} type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setActiveField('regPass')} onBlur={() => setActiveField(null)} /></div>
                  <button className="primary-action" style={{ ...UI.primaryAction, ...(buttonPressed ? UI.primaryActionPressed : {}) }} onClick={() => { setCurrentStep(2); triggerHaptic(); }}>
                    PROCEED TO CLINICAL DETAILS ➡️
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ animation: "slideIn 0.4s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🎂 Age</label><input style={{ ...UI.field, ...(activeField === 'age' ? UI.fieldActive : {}) }} type="number" value={age} onChange={(e) => setAge(e.target.value)} onFocus={() => setActiveField('age')} onBlur={() => setActiveField(null)} /></div>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🚻 Gender</label>
                      <select style={{ ...UI.field, ...(activeField === 'gender' ? UI.fieldActive : {}), paddingRight: "56px" }} value={gender} onChange={(e) => setGender(e.target.value)} onFocus={() => setActiveField('gender')} onBlur={() => setActiveField(null)} className="field-select">
                        <option value="">Select</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🩸 Blood Type</label>
                      <select style={{ ...UI.field, ...(activeField === 'blood' ? UI.fieldActive : {}), paddingRight: "56px" }} value={bloodGrp} onChange={(e) => setBloodGrp(e.target.value)} onFocus={() => setActiveField('blood')} onBlur={() => setActiveField(null)} className="field-select">
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🔢 Zip Code</label><input style={{ ...UI.field, ...(activeField === 'pin' ? UI.fieldActive : {}) }} placeholder="000000" value={pinCode} onChange={(e) => setPinCode(e.target.value)} onFocus={() => setActiveField('pin')} onBlur={() => setActiveField(null)} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "32px" }}>
                    <button style={{ ...UI.secondaryAction, ...(buttonPressed ? UI.secondaryActionPressed : {}) }} onClick={() => { setCurrentStep(1); triggerHaptic(); }}>🔙 BACK</button>
                    <button className="primary-action" style={{ ...UI.primaryAction, ...(buttonPressed ? UI.primaryActionPressed : {}) }} onClick={() => { setCurrentStep(3); triggerHaptic(); }}>NEXT ➡️</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ animation: "slideIn 0.4s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🏢 District</label><input style={{ ...UI.field, ...(activeField === 'district' ? UI.fieldActive : {}) }} placeholder="Manhattan" value={district} onChange={(e) => setDistrict(e.target.value)} onFocus={() => setActiveField('district')} onBlur={() => setActiveField(null)} /></div>
                    <div style={UI.inputContainer}><label style={UI.inputLabel}>🚩 State</label>
                      <select style={{ ...UI.field, ...(activeField === 'state' ? UI.fieldActive : {}), paddingRight: "56px" }} value={state} onChange={(e) => setState(e.target.value)} onFocus={() => setActiveField('state')} onBlur={() => setActiveField(null)} className="field-select">
                        <option value="">Select</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={UI.inputContainer}><label style={UI.inputLabel}>🏥 Clinical Facility Address</label><input style={{ ...UI.field, ...(activeField === 'address' ? UI.fieldActive : {}) }} placeholder="Department of Dermatology, Room 402..." value={address} onChange={(e) => setAddress(e.target.value)} onFocus={() => setActiveField('address')} onBlur={() => setActiveField(null)} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "32px" }}>
                    <button style={{ ...UI.secondaryAction, ...(buttonPressed ? UI.secondaryActionPressed : {}) }} onClick={() => { setCurrentStep(2); triggerHaptic(); }}>🔙 BACK</button>
                    <button className="primary-action" style={{ ...UI.primaryAction, ...(buttonPressed ? UI.primaryActionPressed : {}) }} onClick={handleRegister} disabled={loading}>
                      {loading ? "⚙️ FINALIZING..." : "🚀 COMPLETE ENROLLMENT"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toggle */}
        <div style={UI.toggleArea}>
          <span style={{ color: COLORS.TEXT_MUTED, fontSize: "1.05rem" }}>
            {isLogin ? "New clinical practitioner?" : "Already part of the network?"}
          </span>
          <div className="toggle-link" style={{ color: COLORS.ACCENT_TEAL, fontWeight: 800, cursor: "pointer", marginTop: "16px", fontSize: "1.2rem" }}
            onClick={() => { setIsLogin(!isLogin); triggerHaptic('heavy'); }}>
            {isLogin ? "Initialize New Account ✨" : "Secure Login Portal 🔐"}
          </div>
        </div>
      </div>

      {/* Success Modal (now perfectly centered) */}
      {showSuccessModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 12, 27, 0.92)",
          backdropFilter: "blur(32px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          animation: "modalFade 0.5s ease-out"
        }}>
          <div style={{
            background: COLORS.CARD_BG,
            backdropFilter: "blur(32px)",
            borderRadius: "32px",
            padding: "48px 40px",
            maxWidth: "90%",
            width: "440px",
            textAlign: "center",
            border: `1px solid ${COLORS.BORDER}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 0 40px rgba(100, 255, 218, 0.1)",
            animation: "modalScale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            <div style={{ fontSize: "5.5rem", marginBottom: "24px", animation: "pulse 2s infinite" }}>
              ✅
            </div>
            <h2 style={{
              fontSize: "2.3rem",
              fontWeight: 900,
              background: `linear-gradient(135deg, ${COLORS.ACCENT_TEAL}, ${COLORS.ACCENT_GOLD})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 20px"
            }}>
              {isLogin ? "Login Successful" : "Enrollment Successful"}
            </h2>
            <p style={{ color: COLORS.TEXT_LIGHT, fontSize: "1.15rem", lineHeight: "1.7", margin: "0 0 28px" }}>
              {isLogin ? "Secure access granted. Welcome back." : "Your practitioner profile is now active. Welcome to the DermAI network."}
            </p>
            <p style={{ color: COLORS.TEXT_MUTED, fontSize: "1rem" }}>
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={UI.footer}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center", gap: "32px", fontSize: "0.95rem" }}>
          <span style={{ opacity: 0.7 }}>Privacy Protocol</span>
          <span style={{ opacity: 0.7 }}>Security Whitepaper</span>
        </div>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>© 2026 DermAI Clinical Solutions • v5.0.1-PRO</p>
        <div style={{ marginTop: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <div style={{ width: "12px", height: "12px", background: COLORS.ACCENT_TEAL, borderRadius: "50%", boxShadow: `0 0 16px ${COLORS.ACCENT_TEAL}`, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.85rem", color: COLORS.ACCENT_TEAL, fontWeight: 700, letterSpacing: "1.2px" }}>SYSTEM OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}