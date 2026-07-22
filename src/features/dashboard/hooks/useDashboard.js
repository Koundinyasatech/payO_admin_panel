import { useState, useEffect } from 'react';
import { getDashboardWidgetStats } from '../../../api/adminApi';
import { getAllSubmissions } from '../../../api/kyc.api';

export function useDashboard() {
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [kycs, setKycs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [error, setError] = useState('');

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeWallets, setActiveWallets] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [payoCirculation, setPayoCirculation] = useState(0);
  const [referralRewards, setReferralRewards] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState(true);

  useEffect(() => {
    // ── Fetch KYC submissions ──
    getAllSubmissions()
      .then(res => {
        const arr = res.data?.kycs || [];
        setKycs(arr);
        
        // Compute stats from KYC data
        const total = arr.length;
        const approved = arr.filter(r => r.status === 'approved' || r._normalStatus === 'Approved').length;
        const rejected = arr.filter(r => r.status === 'rejected' || r._normalStatus === 'Failed').length;
        const pending = arr.filter(r => r.status === 'under_review' || r.status === 'not_started' || r.status === 'documents_uploaded' || r._normalStatus === 'Pending' || r._normalStatus === 'In Review').length;
        
        setStats({ totalSubmissions: total, approved, rejected, pending });
        setActiveWallets(approved);
        
        // Compute totalUsers from unique userIds in KYC records
        const userIds = new Set();
        arr.forEach(r => {
          const uid = r.userId?._id || r.userId;
          if (uid) userIds.add(String(uid));
        });
        setTotalUsers(userIds.size);
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => {
        setLoadingStats(false);
        setLoadingKyc(false);
      });

    // ── Widget stats ──
    getDashboardWidgetStats()
      .then(res => {
        const d = res.data || {};
        setTotalTxns(d.totalTransactions ?? 0);
        setPayoCirculation(d.payoInCirculation ?? 0);
        setReferralRewards(d.referralRewardsDistributed ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoadingWidgets(false));
  }, []);

  // Filter KYC list by date (unchanged)
  const filteredKyc = (kycs || []).filter(r => {
    if (dateFilter === 'all') return true;
    const d = new Date(r.createdAt);
    const now = new Date();
    if (dateFilter === 'today') { const t = new Date(); t.setHours(0,0,0,0); return d >= t; }
    if (dateFilter === 'yesterday') { const t = new Date(); t.setDate(t.getDate()-1); t.setHours(0,0,0,0); const e = new Date(t); e.setHours(23,59,59,999); return d >= t && d <= e; }
    if (dateFilter === '7days') { const t = new Date(); t.setDate(t.getDate()-7); return d >= t; }
    if (dateFilter === '30days') { const t = new Date(); t.setDate(t.getDate()-30); return d >= t; }
    if (dateFilter === 'month') { return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
    if (dateFilter === 'lastmonth') { const lm = new Date(now.getFullYear(), now.getMonth()-1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); }
    return true;
  });

  const totalSubmissions = stats?.totalSubmissions || 0;
  const pendingKYC = (stats?.pending) || 0;
  const approvedKYC = stats?.approved || 0;
  const rejectedKYC = stats?.rejected || 0;
  const widgetLoading = loadingWidgets || loadingStats;

  return {
    dateFilter,
    stats,
    kycs,
    loadingStats,
    loadingKyc,
    error,
    totalUsers,
    activeWallets,
    totalTxns,
    payoCirculation,
    referralRewards,
    loadingWidgets,
    widgetLoading,
    totalSubmissions,
    pendingKYC,
    approvedKYC,
    rejectedKYC,
    filteredKyc,
    setDateFilter,
  };
}