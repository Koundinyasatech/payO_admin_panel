import api from "./Axios";

export const getDashboardStats = () =>
  api.get("/api/admin/kyc/dashboard-stats");

export const getAllSubmissions = () =>
  api.get("/api/admin/kyc/all-submissions");

export const getPendingReviews = () =>
  api.get("/api/admin/kyc/pending-reviews");

export const searchUserKYC = (query) =>
  api.get("/api/admin/kyc/search-user", { params: { query } });

export const getSubmissionDetails = (kycId) =>
  api.get(`/api/admin/kyc/submission-details/${kycId}`);

export const approveKYC = (kycId) =>
  api.patch(`/api/admin/kyc/approve-verification/${kycId}`);

export const rejectKYC = (kycId, reason) =>
  api.patch(`/api/admin/kyc/reject-verification/${kycId}`, { reason });

export const bulkApproveKYC = (kycIds) =>
  api.patch("/api/admin/kyc/bulk-approve", { kycIds });

export const bulkRejectKYC = (kycIds, reason) =>
  api.patch("/api/admin/kyc/bulk-reject", { kycIds, reason });

export const deleteKYCRecord = (kycId) =>
  api.delete(`/api/admin/kyc/delete-record/${kycId}`);

export const getAuditLog = () =>
  api.get("/api/admin/kyc/audit-log");