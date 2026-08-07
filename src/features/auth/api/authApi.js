// src/features/auth/api/authApi.js
import api from "../../../api/Axios";
import axios from "axios";

const getClientIP = async () => {
  const { data } = await axios.get("https://api.ipify.org?format=json");
  return data.ip;
};

export const loginAdmin = async (username, password) => {
  const ipAddress = await getClientIP();
  const userAgent = navigator.userAgent;
  return api.post("/api/admin/auth/login", { username, password, ipAddress, userAgent });
};

export const changePassword = (currentPassword, newPassword) =>
  api.patch("/api/admin/auth/change-password", { currentPassword, newPassword });

export const getAllAdmins = () => api.get("/api/admin/auth/all-admins");
export const createSubAdmin = (data) => api.post("/api/admin/auth/create-admin", data);
export const revokeAdminAccess = (adminId) => api.patch(`/api/admin/auth/revoke-admin/${adminId}`);
export const updateAdminRole = (adminId, adminRole) =>
  api.patch(`/api/admin/auth/update-admin-role/${adminId}`, { adminRole });