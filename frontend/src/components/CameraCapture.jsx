import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

// --- START MOCK DATA & COMPONENTS ---
const DISEASE_INFO = {
  Melanoma: { name: "Melanoma", description: "A highly metastatic form of skin cancer arising from melanocytes.", recommendation: "Urgent surgical consultation required." },
  Nevus: { name: "Nevus", description: "Common pigmented skin lesion, usually benign.", recommendation: "Monitor for changes in symmetry or color." },
};

const getDoctors = async () => {
  return { data: { doctors: [{ name: "Dr. Alexander Wright", specialist: "Oncologist", hospital: "Central Med", city: "London", contact: "+44-0022" }] } };
};

function RiskSpeedometer({ confidence }) {
  const rotation = (confidence / 100) * 180;
  const color = confidence > 80 ? "#10b981" : confidence > 50 ? "#FFD700" : "#FF6347";

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <div style={{ position: "relative", width: "200px", height: "100px", margin: "0 auto", overflow: "hidden", borderRadius: "100px 100px 0 0", border: "2px solid rgba(100, 255, 218, 0.2)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", background: `conic-gradient(from 0deg at 50% 100%, #FF6347 0deg, #FFD700 90deg, #10b981 180deg)`, opacity: 0.3 }} />
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: "4px", height: "90px", background: color, transformOrigin: "bottom center", transform: `translateX(-50%) rotate(${rotation - 90}deg)`, transition: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: `0 0 10px ${color}` }} />
      </div>
      <p style={{ color: color, fontWeight: "800", marginTop: "10px", fontSize: "1.2rem", textShadow: `0 0 10px ${color}40` }}>{confidence}% CERTAINTY</p>
    </div>
  );
}
// --- END MOCK DATA & COMPONENTS ---

const UI = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 50% 50%, #112240 0%, #020c1b 100%)",
    padding: "40px 20px",
    color: "#E6F1FF",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  glassCard: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(17, 34, 64, 0.65)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    padding: "30px",
    borderRadius: "28px",
    border: "1px solid rgba(100, 255, 218, 0.15)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    textAlign: "center",
  },
  cameraWrapper: {
    position: "relative",
    width: "280px",
    height: "280px",
    margin: "20px auto",
    borderRadius: "20px",
    overflow: "hidden",
    border: "2px solid #64FFDA",
    boxShadow: "0 0 20px rgba(100, 255, 218, 0.2)",
  },
  targetOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "180px",
    height: "180px",
    border: "2px dashed rgba(100, 255, 218, 0.5)",
    borderRadius: "50%",
    pointerEvents: "none",
    animation: "pulse 2s infinite",
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    background: "rgba(2, 12, 27, 0.4)",
    border: "1px solid rgba(35, 53, 84, 0.8)",
    borderRadius: "14px",
    color: "#E6F1FF",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
    marginBottom: "20px",
  },
  actionButton: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #64FFDA 0%, #48d1af 100%)",
    color: "#020c1b",
    border: "none",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 20px -5px rgba(100, 255, 218, 0.3)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  resultBox: {
    marginTop: "30px",
    textAlign: "left",
    background: "rgba(10, 25, 47, 0.4)",
    padding: "20px",
    borderRadius: "18px",
    borderLeft: "4px solid #FFD700",
  }
};

export default function CameraCapture() {
  const webcamRef = useRef(null);
  const [patientName, setPatientName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const captureImage = async () => {
    setErrorMsg(null);
    setResult(null);
    if (!patientName.trim()) { setErrorMsg("❌ Patient identity required."); return; }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) { setErrorMsg("❌ Camera interface failed."); return; }

    setLoading(true);
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      formData.append("patient_name", patientName);

      const apiUrl = import.meta.env.VITE_API_URL || "http://10.0.2.2:8000";
      const response = await axios.post(`${apiUrl}/predict`, formData);
      
      const data = response.data;
      const diseaseName = data.class || "Unknown";
      const info = DISEASE_INFO[diseaseName] || { name: diseaseName, description: "System mapping required.", recommendation: "Consult clinical staff." };

      setResult({ ...data, ...info });
      const docRes = await getDoctors(info.name);
      if (docRes?.data?.doctors) setDoctors(docRes.data.doctors);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErrorMsg("❌ Neural link failed. Check server status.");
    }
    setLoading(false);
  };

  return (
    <div style={UI.container}>
      <style>{`
        @keyframes pulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } 50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        input:focus { border-color: #64FFDA !important; box-shadow: 0 0 15px rgba(100, 255, 218, 0.15) !important; background: rgba(2, 12, 27, 0.7) !important; }
      `}</style>

      <h2 style={{ fontSize: "2.2rem", fontWeight: "900", background: "linear-gradient(135deg, #64FFDA 0%, #CCD6F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "30px" }}>
        BIO-SCANNER
      </h2>

      <div style={UI.glassCard} className="pop-in">
        <input
          style={UI.input}
          placeholder="PATIENT IDENTIFIER"
          onChange={(e) => setPatientName(e.target.value)}
          value={patientName}
        />

        <div style={UI.cameraWrapper}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 280, height: 280, facingMode: "environment" }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={UI.targetOverlay} />
        </div>

        <p style={{ color: "#8892B0", fontSize: "0.85rem", marginBottom: "20px", letterSpacing: "1px" }}>
          ALIGN LESION WITHIN TARGETING CIRCLE
        </p>

        <button
          onClick={captureImage}
          disabled={loading || !patientName.trim()}
          style={{ ...UI.actionButton, opacity: (loading || !patientName.trim()) ? 0.5 : 1, transform: loading ? "scale(0.98)" : "none" }}
        >
          {loading ? "PROCESSING..." : "CAPTURE & ANALYZE"}
        </button>

        {errorMsg && <p style={{ color: "#FF6347", marginTop: "15px", fontWeight: "bold", fontSize: "0.9rem" }}>{errorMsg}</p>}

        {result && (
          <div style={UI.resultBox} className="pop-in">
            <h3 style={{ color: "#FFD700", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
              🔬 DIAGNOSIS: {result.class}
            </h3>
            
            <RiskSpeedometer confidence={result.confidence || 0} />

            {result.heatmap_base64 && (
              <div style={{ marginTop: "20px" }}>
                <img src={`data:image/png;base64,${result.heatmap_base64}`} alt="Heatmap" style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(100, 255, 218, 0.3)" }} />
                <p style={{ textAlign: "center", color: "#64FFDA", fontSize: "0.75rem", marginTop: "8px", fontWeight: "bold" }}>NEURAL ATTENTION MAP</p>
              </div>
            )}

            <div style={{ marginTop: "25px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
              <h4 style={{ color: "#64FFDA", fontSize: "0.9rem", marginBottom: "5px" }}>CLINICAL DATA:</h4>
              <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.4" }}>{result.description}</p>
              <p style={{ marginTop: "15px", fontWeight: "bold", fontSize: "0.9rem", color: "#E6F1FF" }}>
                PROTOCOL: <span style={{ color: "#FFD700" }}>{result.recommendation}</span>
              </p>
            </div>

            {doctors.length > 0 && (
              <div style={{ marginTop: "25px" }}>
                <h4 style={{ color: "#64FFDA", fontSize: "0.9rem", marginBottom: "12px", borderBottom: "1px dashed rgba(100, 255, 218, 0.2)", paddingBottom: "5px" }}>DIRECT SPECIALISTS:</h4>
                {doctors.map((doc, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px", marginBottom: "10px", border: "1px solid rgba(100, 255, 218, 0.1)" }}>
                    <h5 style={{ color: "#FFD700", margin: "0 0 4px 0" }}>{doc.name}</h5>
                    <p style={{ fontSize: "0.8rem", margin: 0, color: "#8892B0" }}>{doc.specialist} • {doc.hospital}</p>
                    <a href={`tel:${doc.contact}`} style={{ color: "#64FFDA", textDecoration: "none", fontSize: "0.8rem", fontWeight: "bold", display: "block", marginTop: "5px" }}>CALL: {doc.contact}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}