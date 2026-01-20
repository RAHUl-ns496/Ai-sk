import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# ----------------------------
# Initialize Session State
# ----------------------------
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.role = None
    st.session_state.username = ""

if "current_page" not in st.session_state:
    st.session_state.current_page = "login"

# Mock data for demo
mock_procedures = ["Appendectomy", "Knee Replacement", "Cataract Surgery"]
mock_phases = ["Day 1–3", "Day 4–7", "Week 2–4"]
mock_guidelines = {
    "Appendectomy": {
        "Day 1–3": "Rest completely. Avoid lifting >5 lbs. Keep incision dry.",
        "Day 4–7": "Light walking encouraged. Monitor for fever or redness."
    }
}

# Simulated daily logs (for patient view)
today = datetime.today().date()
mock_logs = pd.DataFrame({
    "Date": [today - timedelta(days=i) for i in range(6, -1, -1)],
    "Pain (0-10)": [6, 5, 4, 3, 3, 2, 2],
    "Mobility (0-10)": [2, 3, 4, 5, 6, 7, 8],
    "Sleep Quality (0-10)": [5, 6, 6, 7, 7, 8, 8],
    "Medication Taken": [True, True, True, False, True, True, True],
    "Notes": ["", "", "Slight dizziness", "", "Felt better today", "", ""]
})

# ----------------------------
# Page Functions (Frontend Only)
# ----------------------------

def login_page():
    st.title("🔐 Post-Procedure Recovery Platform")
    st.subheader("Sign In")
    username = st.text_input("Username")
    password = st.text_input("Password", type="password")
    role = st.selectbox("Role", ["Patient", "Doctor", "Admin", "Caregiver"])
    
    if st.button("Login"):
        # Simulate login (no real auth)
        st.session_state.logged_in = True
        st.session_state.role = role.lower()
        st.session_state.username = username
        st.session_state.current_page = "dashboard"
        st.rerun()

def logout():
    st.session_state.logged_in = False
    st.session_state.role = None
    st.session_state.username = ""
    st.session_state.current_page = "login"
    st.rerun()

def sidebar_nav():
    st.sidebar.title(f"Welcome, {st.session_state.username}")
    st.sidebar.write(f"Role: {st.session_state.role.capitalize()}")
    
    pages = ["Dashboard"]
    if st.session_state.role == "admin":
        pages += ["Manage Care Content"]
    elif st.session_state.role == "patient":
        pages += ["Log Daily Recovery", "My Procedure"]
    elif st.session_state.role == "doctor":
        pages += ["Review Alerts", "Patient Records"]
    
    st.sidebar.button("Logout", on_click=logout)
    choice = st.sidebar.radio("Navigation", pages)
    st.session_state.current_page = choice

# ----------------------------
# MODULE 1: Auth & Role (Simulated)
# ----------------------------
if not st.session_state.logged_in:
    login_page()
else:
    sidebar_nav()

    # ----------------------------
    # MODULE 8: Dashboard (CORE)
    # ----------------------------
    if st.session_state.current_page == "Dashboard":
        st.title("🩺 Recovery Dashboard")
        
        st.info("💡 This platform provides **general recovery support only** — not medical diagnosis.")
        
        # Display care guidelines (MODULE 2 content)
        st.subheader("📘 General Care Guidelines")
        proc = st.selectbox("Procedure Type", mock_procedures, key="dash_proc")
        phase = st.selectbox("Recovery Phase", mock_phases, key="dash_phase")
        guideline = mock_guidelines.get(proc, {}).get(phase, "No guideline available for this phase.")
        st.markdown(f"> {guideline}")
        
        # Recovery trends (MODULE 4 + 8)
        st.subheader("📈 Your Recovery Trends (Last 7 Days)")
        fig = px.line(mock_logs, x="Date", y=["Pain (0-10)", "Mobility (0-10)", "Sleep Quality (0-10)"],
                      markers=True)
        st.plotly_chart(fig, use_container_width=True)
        
        # Alerts (MODULE 6)
        st.subheader("⚠️ Recent Alerts")
        st.warning("Pain level increased for 2 consecutive days (Days 6–5).")
        st.info("Missed log entry on Day 3.")
        
        # Milestones (MODULE 8)
        st.subheader("🎯 Recovery Milestones")
        st.success("✅ Walked 10 minutes without pain (Day 5)")
        st.progress(60)
        st.caption("60% through expected recovery timeline")

    # ----------------------------
    # MODULE 4: Daily Recovery Logging (Patient)
    # ----------------------------
    elif st.session_state.current_page == "Log Daily Recovery" and st.session_state.role == "patient":
        st.title("📝 Log Today's Recovery")
        with st.form("daily_log"):
            st.slider("Pain Level (0 = none, 10 = severe)", 0, 10, 3)
            st.slider("Mobility Level (0 = bedridden, 10 = normal)", 0, 10, 6)
            st.selectbox("Swelling Status", ["None", "Mild", "Moderate", "Severe"])
            st.slider("Sleep Quality (0 = poor, 10 = restful)", 0, 10, 7)
            st.checkbox("Took all medications as prescribed")
            st.text_area("Additional Notes (optional)")
            if st.form_submit_button("Submit Log"):
                st.success("✅ Log saved for today!")

    # ----------------------------
    # MODULE 3: Patient Profile & Procedure
    # ----------------------------
    elif st.session_state.current_page == "My Procedure" and st.session_state.role == "patient":
        st.title("📋 My Procedure Details")
        st.text_input("Full Name", value="Alex Johnson")
        st.selectbox("Procedure", mock_procedures, index=1)
        st.date_input("Recovery Start Date", value=datetime(2026, 1, 10))
        st.text_input("Assigned Doctor", value="Dr. Smith")
        st.button("Update Profile")

    # ----------------------------
    # MODULE 2: Admin Care Content Management
    # ----------------------------
    elif st.session_state.current_page == "Manage Care Content" and st.session_state.role == "admin":
        st.title("🛠️ Admin: Care Content Management")
        
        tab1, tab2, tab3 = st.tabs(["Guidelines", "Templates", "Doctors"])
        
        with tab1:
            st.subheader("Add/Update Care Guidelines")
            proc_type = st.text_input("Procedure Type")
            phase = st.text_input("Recovery Phase (e.g., Day 1–3)")
            guideline_text = st.text_area("General Care Instructions")
            st.button("Save Guideline")
        
        with tab2:
            st.subheader("Response Templates for Doctors")
            st.text_input("Template Title")
            st.text_area("Template Message")
            st.button("Add Template")
        
        with tab3:
            st.subheader("Manage Doctor Approvals")
            st.dataframe(pd.DataFrame([{"Name": "Dr. Smith", "Status": "Approved"}]))
            st.button("Approve Selected")

    # ----------------------------
    # MODULE 7: Doctor Review & Guidance
    # ----------------------------
    elif st.session_state.current_page == "Review Alerts" and st.session_state.role == "doctor":
        st.title("👁️‍🗨️ Review Patient Alerts")
        
        st.subheader("Active Alerts")
        alert1 = st.expander("⚠️ Alex Johnson – Pain Increase (High)")
        with alert1:
            st.write("**Reason**: Pain level rose from 2 → 6 over 2 days.")
            st.line_chart(mock_logs.set_index("Date")["Pain (0-10)"])
            template = st.selectbox("Select Response Template", ["Reassurance", "Hydration Reminder", "Seek In-Person Care"])
            note = st.text_area("Add Brief Note (Optional)")
            col1, col2 = st.columns(2)
            col1.button("Send Guidance")
            col2.button("Mark Resolved")

    # ----------------------------
    # MODULE 7: Patient Records (Doctor View)
    # ----------------------------
    elif st.session_state.current_page == "Patient Records" and st.session_state.role == "doctor":
        st.title("🧑‍⚕️ Patient Recovery Records")
        patient = st.selectbox("Select Patient", ["Alex Johnson", "Maria Garcia"])
        st.subheader(f"Recovery Logs: {patient}")
        st.dataframe(mock_logs)
        st.subheader("Recovery Consistency Score")
        st.metric("Consistency", "82%", delta="-3% (last week)")

    else:
        st.info("🔒 Access restricted based on your role.")