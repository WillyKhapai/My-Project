import streamlit as st
import time
import random

# --- Constants ---
MAX_LEVEL = 100
DRAIN_RATE_BASE = 0.5

# --- Session State ---
if "waterLevel" not in st.session_state:
    st.session_state.waterLevel = 30.0
if "rainIntensity" not in st.session_state:
    st.session_state.rainIntensity = 0
if "drainPower" not in st.session_state:
    st.session_state.drainPower = 1.0
if "temp" not in st.session_state:
    st.session_state.temp = 24.5

# --- Sidebar Controls ---
st.sidebar.title("Environment Control")

rain = st.sidebar.slider("Rain Intensity (mm/h)", 0, 100, st.session_state.rainIntensity)
drain = st.sidebar.slider("Drain Power", 0.0, 5.0, st.session_state.drainPower)

st.session_state.rainIntensity = rain
st.session_state.drainPower = drain

# --- Simulation Step ---
rain_effect = rain / 10
drain_effect = (drain * DRAIN_RATE_BASE) / 5

st.session_state.waterLevel += rain_effect - drain_effect
st.session_state.waterLevel = max(0, min(MAX_LEVEL, st.session_state.waterLevel))

# Temp fluctuation
st.session_state.temp += (random.random() - 0.5) * 0.1

# --- Warning Level ---
if st.session_state.waterLevel > 85:
    status = "DANGER"
elif st.session_state.waterLevel > 65:
    status = "WARNING"
elif st.session_state.waterLevel > 45:
    status = "CAUTION"
else:
    status = "SAFE"

# --- UI ---
st.title("HydraGuard Simulation")

st.metric("Water Level", f"{st.session_state.waterLevel:.1f} %")
st.metric("Temperature", f"{st.session_state.temp:.1f} °C")
st.metric("Status", status)

st.progress(st.session_state.waterLevel / 100)

# Auto refresh
time.sleep(0.1)
st.rerun()