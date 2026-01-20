import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://10.189.132.247:8000"
});

API.interceptors.response.use(
  response => response,
  error => {
    console.error("API ERROR:", error?.response || error);
    return Promise.reject(error);
  }
);

export const predictImage = async (file, patient) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_name", patient);

  const res = await API.post("/predict", formData);
  return res.data;
};

export const getDoctors = (disease) => API.get(`/doctors/${disease}`);
export const getHistory = () => API.get("/history");
export const getEvaluation = () => API.get("/evaluation");
export const getDashboard = () => API.get("/dashboard");