import axios from "axios";
import { authSession } from "../services/authSession";
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081"
});
adminApiClient.interceptors.request.use((config) => {
  const token = authSession.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default adminApiClient;
