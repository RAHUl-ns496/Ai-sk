import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Sidebar from "./components/Sidebar";
import CameraCapture from "./components/CameraCapture";
import ProtectedRoute from "./components/protectedRoute";
import Login from "./pages/Login";
import Predict from "./pages/predict";
import History from "./pages/history";
import Evaluation from "./pages/evaluation";
import Dashboard from "./pages/dashboard";

import "./styles.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // Ensure loading is false after a change
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#00040f', color: '#64FFDA' }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* 🧠 Root container must match .app-container from GlobalStyles */}
      <div className="app-container">
        {/* Show sidebar only after login */}
        {session && <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />}

        {/* 💡 This is now the full-height, safe-area-aware content area */}
        <div className="main-content">
          <div className={darkMode ? "app dark" : "app"}>
            <Routes>
              {/* ✅ First Page Always Login */}
              <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

              {/* ✅ Login Page */}
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

              {/* ✅ Protected Pages */}
              <Route
                path="/predict"
                element={
                  <ProtectedRoute session={session}>
                    <Predict />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/camera"
                element={
                  <ProtectedRoute session={session}>
                    <CameraCapture />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute session={session}>
                    <History />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/evaluation"
                element={
                  <ProtectedRoute session={session}>
                    <Evaluation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute session={session}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}