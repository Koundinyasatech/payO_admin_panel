// src/api/adminApi.js
import api from "./Axios";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const getAllAdmins = () =>
  api.get("/api/admin/auth/all-admins");

export const createSubAdmin = (data) =>
  api.post("/api/admin/auth/create-admin", data);

export const revokeAdminAccess = (adminId) =>
  api.patch(`/api/admin/auth/revoke-admin/${adminId}`);

export const updateAdminRole = (adminId, adminRole) =>
  api.patch(`/api/admin/auth/update-admin-role/${adminId}`, { adminRole });

// ─── Users ───────────────────────────────────────────────────────────────────
export const exportUsers = (type) =>
  api.get("/api/admin/auth/export-users", {
    params: { type },
    responseType: "blob",
  });

// ─── Dashboard Widget Stats ─────────────────────────────────────────────────
export const getDashboardWidgetStats = () =>
  api.get("/api/admin/stats/widgets");

// ─── Transactions ────────────────────────────────────────────────────────────
export const getTransactions = (params = {}) =>
  api.get("/api/admin/stats/transactions", { params });

export const getTransactionDetails = (transactionId) =>
  api.get(`/api/admin/stats/transactions/${transactionId}`);

export const exportTransactions = async (params) => {
  return api.get("/api/admin/stats/transactions/export", {
    params,
    responseType: "blob",
  });
};

// ─── Referrals ────────────────────────────────────────────────────────────────
export const getReferrals = (params = {}) =>
  api.get("/api/admin/stats/referrals", { params });

// ─── User Detail Tabs ────────────────────────────────────────────────────────
export const getUserKycDocs = (userId) =>
  api.get(`/api/admin/user-details/${userId}/kyc`);

export const getUserTransactions = (userId, params = {}) =>
  api.get(`/api/admin/user-details/${userId}/transactions`, { params });

export const getUserReferralDetails = (userId) =>
  api.get(`/api/admin/user-details/${userId}/referral`);

// ─── Payo Deposits (Wallet) ──────────────────────────────────────────────────
// src/api/adminApi.js – add this at the bottom, inside the "Payo Deposits" section

// ─── Payo Deposits (Wallet) ──────────────────────────────────────────────────
export const getPendingPayoDeposits = async (userId = null) => {
  const url = userId 
    ? `/api/admin/pending-payo-deposits/${userId}` 
    : `/api/admin/pending-payo-deposits`;
  return await api.get(url);
};

// NEW: Approve or Reject a deposit
export const approveRejectDeposit = (payload) => {
  return api.post("api/admin/deposit-approval-reject", payload);
};