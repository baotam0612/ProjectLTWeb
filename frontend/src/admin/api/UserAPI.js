import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/api/admin/users";
const mapApiUserToUser = (apiUser, index) => {
  const roles = Array.isArray(apiUser.roles) ? apiUser.roles : [];
  const isAdmin = roles.includes("ROLE_ADMIN");
  const enabled = Boolean(apiUser.enabled);
  return {
    id: String(apiUser.id ?? `U${String(index + 1).padStart(3, "0")}`),
    username: apiUser.username || "",
    fullName: apiUser.fullName || "",
    email: apiUser.email || "",
    address: apiUser.address || "",
    phoneNumber: apiUser.phoneNumber || "",
    role: isAdmin ? "admin" : "user",
    status: enabled ? "active" : "inactive",
    enabled,
    roles,
    joinDate: apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString("vi-VN") : ""
  };
};
const mapUserToApiPayload = (data) => {
  const payload = {
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    address: data.address,
    phoneNumber: data.phoneNumber,
    role: data.role === "admin" ? "ROLE_ADMIN" : "ROLE_USER",
    enabled: data.status ? data.status === "active" : Boolean(data.enabled)
  };
  if (data.password && String(data.password).trim().length > 0) {
    payload.password = data.password;
  }
  return payload;
};
export const getUsers = async () => {
  const response = await adminApiClient.get(API_URL);
  const users = Array.isArray(response.data) ? response.data : response.data.data || [];
  return Array.isArray(users) ? users.map((user, index) => mapApiUserToUser(user, index)) : [];
};
export const createUser = async (data) => {
  const response = await adminApiClient.post(API_URL, mapUserToApiPayload(data));
  const userData = response.data.user || response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};
export const updateUser = async (id, data) => {
  const response = await adminApiClient.put(`${API_URL}/${id}`, mapUserToApiPayload(data));
  const userData = response.data.user || response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};
export const deleteUser = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getUsersPage = (params, signal) => getPage(API_URL, params, mapApiUserToUser, signal);
