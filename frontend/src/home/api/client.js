import { getToken } from "../services/authSession.js";

const API_BASE_URL = "/api";

export async function apiRequest(endpoint, { method = "GET", body, authenticated = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = authenticated ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
  }
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Yêu cầu thất bại (${response.status})`);
    error.status = response.status;
    error.code = data.code;
    error.details = Array.isArray(data.errors) ? data.errors : [];
    throw error;
  }
  return data;
}
