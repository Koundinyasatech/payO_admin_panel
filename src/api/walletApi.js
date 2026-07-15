import api from "./Axios";


export const getWalletProfile = (userId) =>
  api.get("/api/wallet/profile", { params: { userId } });

export const getUserBankDetails = (userId) =>
  api.get(`/api/admin/auth/user-bank-details/${userId}`);