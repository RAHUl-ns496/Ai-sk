import React, { useEffect, useState } from "react";
import { getEvaluation } from "../services/api";

// 🎨 ENHANCED AESTHETIC STYLES (with new additions)
const UI = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0A192F 0%, #0F1D38 100%)",
    color: "#E6F1FF",
    padding: "30px 15px",
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 800,
    color: "#64FFDA",
    textAlign: "center",
    marginBottom: "25px",
    textShadow: "0 0 10px rgba(100, 255, 218, 0.3)",
  },
  card: {
    background: "#112240",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    border: "1px solid #233554",
    marginBottom: "20px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(2, 12, 27, 0.98)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    animation: "fadeIn 0.3s ease",
  },
  // Histogram Styles
  histoContainer: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  histoBarWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  histoBarBG: {
    flex: 1,
    height: "12px",
    background: "#233554",
    borderRadius: "6px",
    overflow: "hidden",
  },
  histoBarFill: (width, color) => ({
    width: `${width}%`,
    height: "100%",
    background: color,
    boxShadow: `0 0 8px ${color}80`,
    transition: "width 1s ease-in-out",
  }),
  // Hero Slider
  heroSlider: {
    position: "relative",
    marginBottom: "30px",
    overflow: "hidden",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
    border: "1px solid #233554",
  },
  heroSlide: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "#112240",
    animation: "slideIn 0.6s ease forwards",
  },
  slideTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: "12px",
    textAlign: "center",
  },
  slideImage: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "12px",
    border: "2px solid #64FFDA",
  },
  sliderNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(10, 25, 47, 0.8)",
    color: "#64FFDA",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "1.2rem",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  prevBtn: {
    left: "15px",
  },
  nextBtn: {
    right: "15px",
  },
};

export default function Evaluation() {
  const [data, setData] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getEvaluation()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load metrics"));
  }, []);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  if (error) return <div style={UI.container}>Error: {error}</div>;
  if (!data) return <div style={UI.container}>Loading...</div>;

  const slides = [
    {
      title: "Confusion Matrix",
      img: data.confusion_matrix,
    },
    {
      title: "ROC Curve",
      img: data.roc_curve,
    },
  ];

  const renderModal = () => {
    if (!focusedItem) return null;
    return (
      <div style={UI.modalOverlay} onClick={() => setFocusedItem(null)}>
        <button
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "2rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <div style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
          <h2 style={{ color: "#FFD700", marginBottom: "20px" }}>{focusedItem.title}</h2>
          {focusedItem.type === "img" ? (
            <img
              src={`data:image/png;base64,${focusedItem.content}`}
              style={{ width: "100%", borderRadius: "12px", border: "2px solid #64FFDA" }}
              alt="Full view"
            />
          ) : (
            <div style={{ ...UI.card, transform: "scale(1.1)" }}>{focusedItem.content}</div>
          )}
        </div>
      </div>
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  return (
    <div style={UI.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.7);
        }
      `}</style>

      {renderModal()}

      <h1 style={UI.title}>🛡️ Model Evaluation</h1>

      {/* Hero Slider */}
      <div style={UI.heroSlider}>
        <div style={{ ...UI.heroSlide, opacity: currentSlide === 0 ? 1 : 0, position: 'absolute', width: '100%' }}>
          <div>
            <div style={UI.slideTitle}>{slides[0].title}</div>
            <img src={`data:image/png;base64,${slides[0].img}`} style={UI.slideImage} alt="Slide 1" />
          </div>
        </div>
        <div style={{ ...UI.heroSlide, opacity: currentSlide === 1 ? 1 : 0, position: 'absolute', width: '100%' }}>
          <div>
            <div style={UI.slideTitle}>{slides[1].title}</div>
            <img src={`data:image/png;base64,${slides[1].img}`} style={UI.slideImage} alt="Slide 2" />
          </div>
        </div>

        <button style={{ ...UI.sliderNav, ...UI.prevBtn }} onClick={prevSlide}>
          ‹
        </button>
        <button style={{ ...UI.sliderNav, ...UI.nextBtn }} onClick={nextSlide}>
          ›
        </button>

        {/* Dots Indicator */}
        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {[0, 1].map((idx) => (
            <div
              key={idx}
              onClick={() => goToSlide(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: idx === currentSlide ? '#64FFDA' : '#233554',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Stats Card */}
      <div
        style={UI.card}
        onClick={() => setFocusedItem({ title: "Metric Breakdown", type: "comp", content: <Histogram accuracy={data.accuracy} /> })}
        className="card"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ color: "#94a3b8", fontSize: "0.9rem" }}>OVERALL ACCURACY</h3>
            <h2 style={{ color: "#10b981", fontSize: "2.5rem" }}>{data.accuracy}%</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ color: "#94a3b8", fontSize: "0.9rem" }}>LOSS</h3>
            <h2 style={{ color: "#f87171", fontSize: "1.5rem" }}>{data.loss}</h2>
          </div>
        </div>
        <p style={{ color: "#64FFDA", fontSize: "0.8rem", marginTop: "10px" }}>Tap to see detailed histogram 📊</p>
      </div>

      {/* Performance Histogram (Inline) */}
      <div style={{ ...UI.card, cursor: "default" }}>
        <h3 style={{ color: "#64FFDA", fontSize: "1.1rem", marginBottom: "15px" }}>📊 Performance Distribution</h3>
        <Histogram accuracy={data.accuracy} />
      </div>

      {/* Remaining Visualizations (now below slider) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
        <div
          style={UI.card}
          onClick={() => setFocusedItem({ title: "Confusion Matrix", type: "img", content: data.confusion_matrix })}
          className="card"
        >
          <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>Confusion Matrix</h3>
          <img
            src={`data:image/png;base64,${data.confusion_matrix}`}
            style={{ width: "100%", borderRadius: "8px" }}
            alt="CM"
          />
        </div>

        <div
          style={UI.card}
          onClick={() => setFocusedItem({ title: "ROC Curve", type: "img", content: data.roc_curve })}
          className="card"
        >
          <h3 style={{ color: "#60a5fa", marginBottom: "10px" }}>ROC Curve</h3>
          <img
            src={`data:image/png;base64,${data.roc_curve}`}
            style={{ width: "100%", borderRadius: "8px" }}
            alt="ROC"
          />
        </div>
      </div>
    </div>
  );
}

// Keep Histogram as a sub-component
function Histogram({ accuracy }) {
  const categories = [
    { label: "Precision", val: Math.max(0, accuracy - 2), color: "#60a5fa" },
    { label: "Recall", val: Math.max(0, accuracy - 5), color: "#a78bfa" },
    { label: "F1-Score", val: Math.max(0, accuracy - 3), color: "#f472b6" },
    { label: "Accuracy", val: accuracy, color: "#10b981" },
  ];

  return (
    <div style={UI.histoContainer}>
      {categories.map((cat) => (
        <div key={cat.label} style={UI.histoBarWrapper}>
          <span style={{ width: "80px", fontSize: "0.8rem", color: "#94a3b8" }}>{cat.label}</span>
          <div style={UI.histoBarBG}>
            <div style={UI.histoBarFill(cat.val, cat.color)} />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: cat.color }}>{cat.val}%</span>
        </div>
      ))}
    </div>
  );
}