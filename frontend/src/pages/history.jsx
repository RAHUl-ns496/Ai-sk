import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getHistory } from "../services/api";

const RECORDS_PER_PAGE = 10;

export default function History() {
  const [initialRecords, setInitialRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: "time", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [touchStart, setTouchStart] = useState(null);
  const [swipedIndex, setSwipedIndex] = useState(null);
  const [swipeThreshold, setSwipeThreshold] = useState(60);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  // 👤 Profile state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : { name: "Alex Johnson", emoji: "👤" };
  });

  // Persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist user profile
  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Fetch history
  useEffect(() => {
    setLoading(true);
    getHistory()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setInitialRecords(data);
        setError(null);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError("Failed to load prediction history.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredAndSortedRecords = useMemo(() => {
    let records = [...initialRecords];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      records = records.filter(
        (rec) =>
          (rec?.patient_name && rec.patient_name.toLowerCase().includes(term)) ||
          (rec?.prediction && rec.prediction.toLowerCase().includes(term))
      );
    }
    if (sort.key) {
      records.sort((a, b) => {
        const aVal = a?.[sort.key] ?? (sort.key === "confidence" ? 0 : "");
        const bVal = b?.[sort.key] ?? (sort.key === "confidence" ? 0 : "");
        if (sort.key === "time") {
          const aTime = new Date(aVal).getTime() || 0;
          const bTime = new Date(bVal).getTime() || 0;
          return sort.direction === "asc" ? aTime - bTime : bTime - aTime;
        } else if (typeof aVal === "string") {
          return sort.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
      });
    }
    return records;
  }, [initialRecords, searchTerm, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRecords.length / RECORDS_PER_PAGE));
  const start = (currentPage - 1) * RECORDS_PER_PAGE;
  const recordsToDisplay = filteredAndSortedRecords.slice(start, start + RECORDS_PER_PAGE);
  const heroRecords = filteredAndSortedRecords.slice(0, 5);

  const handleSort = (key) => {
    const direction = sort.key === key && sort.direction === "asc" ? "desc" : "asc";
    setSort({ key, direction });
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderSortIndicator = (key) => {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  };

  const handleRowClick = (record) => setSelectedRecord(record);

  const handleDeleteRow = (idx) => {
    const actualIndex = start + idx;
    const newRecords = [...initialRecords];
    newRecords.splice(actualIndex, 1);
    setInitialRecords(newRecords);
    setSwipedIndex(null);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e, index) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    if (diff > 20) {
      setSwipedIndex(index);
      const speed = Math.abs(diff) / 10;
      setSwipeThreshold(Math.min(100, Math.max(40, 60 - speed)));
    } else {
      setSwipedIndex(null);
    }
  };

  const handleTouchEnd = (e, index) => {
    if (swipedIndex === index) {
      const endTouch = e.changedTouches[0].clientX;
      const diff = touchStart - endTouch;
      if (diff > swipeThreshold) {
        handleDeleteRow(index);
        if (window.navigator.vibrate) window.navigator.vibrate(20);
      } else {
        setSwipedIndex(null);
      }
    }
    setTouchStart(null);
  };

  const isLight = theme === "light";

  const DARK_BG = "linear-gradient(180deg, #010812 0%, #0a192f 100%)";
  const CARD_BG_DARK = "rgba(8, 18, 36, 0.9)";
  const CARD_BORDER_DARK = "1px solid rgba(100, 255, 218, 0.12)";

  const styles = {
    container: {
      minHeight: "100dvh",
      background: isLight
        ? "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)"
        : DARK_BG,
      padding: "12px 0 70px 0",
      paddingTop: "max(env(safe-area-inset-top), 12px)",
      paddingBottom: "max(env(safe-area-inset-bottom), 70px)",
      color: isLight ? "#1e293b" : "#E6F1FF",
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    headerWrap: {
      padding: "0 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    heroLabel: {
      fontSize: "0.65rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      color: isLight ? "#64748b" : "#64FFDA",
      marginBottom: "8px",
      padding: "0 14px",
    },
    heroSlider: {
      display: "flex",
      overflowX: "auto",
      padding: "0 14px 14px",
      gap: "10px",
      scrollSnapType: "x mandatory",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
    },
    heroCard: {
      flex: "0 0 160px",
      scrollSnapAlign: "start",
      background: isLight ? "#ffffff" : CARD_BG_DARK,
      padding: "12px",
      borderRadius: "14px",
      boxShadow: isLight 
        ? "0 2px 8px rgba(0,0,0,0.04)" 
        : "0 4px 12px rgba(0,0,0,0.3)",
      border: isLight ? "1px solid #edf2f7" : CARD_BORDER_DARK,
      backdropFilter: "blur(8px)",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    heroCardActive: {
      transform: "scale(1.02)",
      boxShadow: isLight 
        ? "0 4px 14px rgba(0,0,0,0.08)" 
        : "0 6px 18px rgba(0,0,0,0.4)",
    },
    searchContainer: {
      padding: "0 14px 12px",
    },
    searchBar: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "none",
      background: isLight ? "#ffffff" : "rgba(10, 25, 47, 0.8)",
      color: isLight ? "#0f172a" : "#E6F1FF",
      fontSize: "0.9rem",
      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      outline: "none",
      transition: "box-shadow 0.2s ease",
      boxSizing: "border-box",
    },
    searchBarFocus: {
      boxShadow: isLight 
        ? "0 4px 12px rgba(59, 130, 246, 0.15)" 
        : "0 4px 12px rgba(100, 255, 218, 0.2)",
    },
    listArea: {
      padding: "0 14px",
    },
    swipeWrapper: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "12px",
      marginBottom: "8px",
    },
    deleteAction: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "60px",
      background: "linear-gradient(90deg, #ff4d4d 0%, #ff6b6b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "0.95rem",
      borderRadius: "0 12px 12px 0",
    },
    rowItem: (isSwiped) => ({
      background: isLight ? "#ffffff" : CARD_BG_DARK,
      padding: "10px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      zIndex: 2,
      transition: "transform 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
      transform: isSwiped ? "translateX(-60px)" : "translateX(0)",
      cursor: "pointer",
      borderRadius: "12px",
      boxShadow: isLight 
        ? "0 1px 3px rgba(0,0,0,0.03)" 
        : "0 1px 4px rgba(0,0,0,0.15)",
      border: isLight ? "1px solid #f1f5f9" : CARD_BORDER_DARK,
    }),
    themeToggle: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: isLight ? "#1e293b" : "#64FFDA",
      color: isLight ? "#fff" : "#020c1b",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      transition: "transform 0.2s ease",
    },
    paginationButton: {
      background: isLight ? "#e2e8f0" : "rgba(100, 255, 218, 0.1)",
      border: "none",
      fontSize: "0.9rem",
      padding: "8px 14px",
      borderRadius: "8px",
      color: isLight ? "#1e293b" : "#64FFDA",
      fontWeight: 600,
    },
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <div className="spinner"></div>
        <p style={{marginTop: "16px", fontWeight: 600, fontSize: "0.95rem", opacity: 0.8}}>Loading...</p>
        <style>{`
          .spinner { 
            width: 36px; 
            height: 36px; 
            border: 3px solid ${isLight ? "rgba(59, 130, 246, 0.1)" : "rgba(100, 255, 218, 0.1)"}; 
            border-top-color: ${isLight ? "#3b82f6" : "#64FFDA"}; 
            border-radius: 50%; 
            animation: spin 0.8s linear infinite; 
          } 
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerWrap}>
        <div>
          <h1 style={{fontSize: "1.2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.3px"}}>Archives</h1>
          <span style={{fontSize: "0.7rem", opacity: 0.5}}>{filteredAndSortedRecords.length} records</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Profile Button */}
          <button
            style={{
              ...styles.themeToggle,
              background: isLight ? "#e2e8f0" : "rgba(100, 255, 218, 0.15)",
              color: isLight ? "#1e293b" : "#64FFDA",
              fontSize: "1.1rem",
              width: "36px",
              height: "36px",
            }}
            onClick={() => setProfileModalOpen(true)}
            onTouchStart={() => {}}
          >
            {userProfile.emoji}
          </button>

          {/* Theme Toggle */}
          <button 
            style={styles.themeToggle} 
            onClick={() => setTheme(isLight ? "dark" : "light")}
            onTouchStart={() => {}}
          >
            {isLight ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Hero Slider - Compact */}
      <div style={styles.heroLabel}>Quick Access</div>
      <div style={styles.heroSlider} className="no-scrollbar">
        {heroRecords.map((rec, i) => (
          <div 
            key={i} 
            style={{
              ...styles.heroCard,
              ...(selectedRecord === rec ? styles.heroCardActive : {})
            }}
            onClick={() => setSelectedRecord(rec)}
            onTouchStart={() => {}}
          >
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
              <span style={{fontSize: "1rem"}}>👤</span>
              <div style={{
                background: rec.confidence > 80 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: rec.confidence > 80 ? "#10b981" : "#f59e0b",
                padding: "2px 6px", 
                borderRadius: "6px", 
                fontSize: "0.6rem", 
                fontWeight: 800,
              }}>
                {rec.confidence}%
              </div>
            </div>
            <div style={{fontWeight: 700, fontSize: "0.8rem", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
              {rec.patient_name}
            </div>
            <div style={{color: isLight ? "#3b82f6" : "#64FFDA", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
              {rec.prediction}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 Search..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={styles.searchBar}
          onFocus={(e) => e.target.style.boxShadow = styles.searchBarFocus.boxShadow}
          onBlur={(e) => e.target.style.boxShadow = styles.searchBar.boxShadow}
        />
      </div>

      {/* Sort Pills - Compact */}
      <div style={{padding: "0 14px 10px", display: "flex", gap: "6px", overflowX: "auto"}} className="no-scrollbar">
        {[{k: "patient_name", l: "Name"}, {k: "prediction", l: "Dx"}, {k: "confidence", l: "%"}, {k: "time", l: "Date"}].map(col => (
          <div 
            key={col.k}
            onClick={() => handleSort(col.k)}
            style={{
              padding: "5px 10px", 
              borderRadius: "8px", 
              whiteSpace: "nowrap", 
              fontSize: "0.68rem", 
              fontWeight: 700,
              background: sort.key === col.k ? (isLight ? "#3b82f6" : "#64FFDA") : (isLight ? "#e2e8f0" : "rgba(17, 34, 64, 0.6)"),
              color: sort.key === col.k ? (isLight ? "#fff" : "#020c1b") : "inherit",
              cursor: "pointer", 
              transition: "all 0.15s",
              minWidth: "fit-content",
            }}
            onTouchStart={() => {}}
          >
            {col.l} {renderSortIndicator(col.k)}
          </div>
        ))}
      </div>

      {/* List */}
      <div style={styles.listArea}>
        {recordsToDisplay.map((rec, i) => (
          <div key={i} style={styles.swipeWrapper}>
            <div style={styles.deleteAction} onClick={() => handleDeleteRow(i)}>🗑️</div>
            <div 
              style={styles.rowItem(swipedIndex === i)}
              onTouchStart={handleTouchStart}
              onTouchMove={(e) => handleTouchMove(e, i)}
              onTouchEnd={(e) => handleTouchEnd(e, i)}
              onClick={() => handleRowClick(rec)}
            >
              <div style={{display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0}}>
                <div style={{
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "8px", 
                  background: isLight ? "#F1F5F9" : "rgba(17, 34, 64, 0.7)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}>
                  🧬
                </div>
                <div style={{minWidth: 0, flex: 1}}>
                  <div style={{fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                    {rec.patient_name || "Anonymous"}
                  </div>
                  <div style={{fontSize: "0.65rem", opacity: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                    {rec.prediction}
                  </div>
                </div>
              </div>
              <div style={{textAlign: "right", flexShrink: 0, marginLeft: "8px"}}>
                <div style={{
                  fontWeight: 800, 
                  color: isLight ? "#3b82f6" : "#64FFDA",
                  fontSize: "0.85rem"
                }}>{rec.confidence}%</div>
                <div style={{fontSize: "0.6rem", opacity: 0.5}}>{rec.time?.split(' ')[0] || "—"}</div>
              </div>
            </div>
          </div>
        ))}
        
        {recordsToDisplay.length === 0 && (
          <div style={{textAlign: "center", padding: "30px 20px", opacity: 0.5}}>
            <div style={{fontSize: "2rem", marginBottom: "8px"}}>📭</div>
            <div style={{fontSize: "0.85rem"}}>No records found</div>
          </div>
        )}
      </div>

      {/* Pagination - Compact */}
      <div style={{padding: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
        <button 
          onClick={() => goToPage(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{...styles.paginationButton, opacity: currentPage === 1 ? 0.3 : 1}}
          onTouchStart={() => {}}
          onTouchEnd={() => {
            if (currentPage > 1 && window.navigator.vibrate) window.navigator.vibrate(10);
          }}
        >
          ←
        </button>
        <div style={{fontSize: "0.8rem", fontWeight: 700, minWidth: "60px", textAlign: "center"}}>
          {currentPage}/{totalPages}
        </div>
        <button 
          onClick={() => goToPage(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={{...styles.paginationButton, opacity: currentPage === totalPages ? 0.3 : 1}}
          onTouchStart={() => {}}
          onTouchEnd={() => {
            if (currentPage < totalPages && window.navigator.vibrate) window.navigator.vibrate(10);
          }}
        >
          →
        </button>
      </div>

      {selectedRecord && (
        <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} isLight={isLight} />
      )}

      {profileModalOpen && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          userProfile={userProfile}
          onSave={(data) => setUserProfile(data)}
          isLight={isLight}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; }
        body { background: ${isLight ? '#F8FAFC' : '#010812'} !important; }
      `}</style>
    </div>
  );
}

// ===== MODALS =====

function DetailModal({ record, onClose, isLight }) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const DARK_BG_MODAL = "#0a192f";

  return (
    <div 
      style={{
        position: "fixed", 
        inset: 0, 
        zIndex: 1000,
        background: isOpen ? "rgba(1, 8, 18, 0.9)" : "transparent",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", 
        alignItems: "flex-end", 
        justifyContent: "center",
        transition: "background 0.25s ease",
      }} 
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div 
        style={{
          background: isLight ? "#ffffff" : DARK_BG_MODAL,
          width: "100%", 
          maxWidth: "420px",
          borderTopLeftRadius: "20px", 
          borderTopRightRadius: "20px",
          padding: "20px 16px",
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
          position: "relative",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{
          width: "32px", 
          height: "4px", 
          background: "rgba(136, 146, 176, 0.25)", 
          borderRadius: "4px", 
          margin: "0 auto 16px",
        }} />
        
        {/* Header */}
        <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px"}}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: isLight ? "#f1f5f9" : "rgba(100, 255, 218, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
          }}>
            🧬
          </div>
          <div>
            <h2 style={{margin: 0, fontSize: "1rem", fontWeight: 700, color: isLight ? "#1e293b" : "#E6F1FF"}}>
              Record Details
            </h2>
            <span style={{fontSize: "0.7rem", opacity: 0.5}}>Analysis Summary</span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px"}}>
          <DetailRow label="Patient" value={record.patient_name} icon="👤" isLight={isLight} />
          <DetailRow label="Confidence" value={`${record.confidence}%`} icon="🎯" isLight={isLight} />
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
          <DetailRow label="Diagnosis" value={record.prediction} icon="📊" isLight={isLight} full />
          <DetailRow label="Timestamp" value={record.time} icon="🕒" isLight={isLight} full />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            width: "100%", 
            marginTop: "16px", 
            padding: "12px", 
            borderRadius: "12px",
            border: "none", 
            background: isLight ? "#3b82f6" : "#64FFDA", 
            color: isLight ? "#fff" : "#020c1b", 
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
          onTouchStart={() => {}}
          onTouchEnd={() => {
            if (window.navigator.vibrate) window.navigator.vibrate(15);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

const DetailRow = ({ label, value, icon, isLight, full }) => (
  <div style={{
    background: isLight ? "rgba(241, 245, 249, 0.8)" : "rgba(17, 34, 64, 0.6)",
    padding: "10px 12px",
    borderRadius: "10px", 
    display: "flex", 
    alignItems: "center", 
    gap: "10px",
    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(100, 255, 218, 0.1)",
    gridColumn: full ? "1 / -1" : "auto",
  }}>
    <span style={{fontSize: "0.9rem"}}>{icon}</span>
    <div style={{minWidth: 0, flex: 1}}>
      <div style={{
        fontSize: "0.6rem", 
        color: isLight ? "#64748b" : "#8892B0", 
        textTransform: "uppercase", 
        letterSpacing: "0.8px",
        marginBottom: "1px",
      }}>{label}</div>
      <div style={{
        fontSize: "0.82rem", 
        fontWeight: 600,
        color: isLight ? "#1e293b" : "#E6F1FF",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>{value || "N/A"}</div>
    </div>
  </div>
);

// ===== PROFILE MODAL =====

function ProfileModal({ isOpen, onClose, userProfile, onSave, isLight }) {
  const [name, setName] = useState(userProfile.name || "");
  const [emoji, setEmoji] = useState(userProfile.emoji || "👤");

  const handleSave = () => {
    onSave({ name, emoji });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed", 
        inset: 0, 
        zIndex: 1001,
        background: "rgba(1, 8, 18, 0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        transition: "all 0.25s ease",
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: isLight ? "#ffffff" : "#0a192f",
          width: "90%",
          maxWidth: "360px",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: isLight ? "#1e293b" : "#E6F1FF" }}>
          Your Profile
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "6px", color: isLight ? "#64748b" : "#8892B0" }}>
            Display Emoji
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(100, 255, 218, 0.2)",
              background: isLight ? "#f8fafc" : "rgba(10, 25, 47, 0.7)",
              color: isLight ? "#0f172a" : "#E6F1FF",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
            maxLength={2}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "6px", color: isLight ? "#64748b" : "#8892B0" }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(100, 255, 218, 0.2)",
              background: isLight ? "#f8fafc" : "rgba(10, 25, 47, 0.7)",
              color: isLight ? "#0f172a" : "#E6F1FF",
              fontSize: "0.95rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: isLight ? "#e2e8f0" : "rgba(100, 255, 218, 0.1)",
              color: isLight ? "#1e293b" : "#64FFDA",
              border: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: isLight ? "#3b82f6" : "#64FFDA",
              color: isLight ? "#fff" : "#020c1b",
              border: "none",
              fontWeight: 700,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}