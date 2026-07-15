import { useState, useEffect } from 'react';
import { getAllUsers, getDashboardWidgetStats } from '../../../api/adminApi';
import { getAllSubmissions, getDashboardStats } from '../../../api/kyc.api';


export function useDashboard() {
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [kycs, setKycs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [error, setError] = useState('');

  // Widget stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeWallets, setActiveWallets] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [payoCirculation, setPayoCirculation] = useState(0);
  const [referralRewards, setReferralRewards] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState(true);

  useEffect(() => {
    // KYC submissions (table)
    getAllSubmissions()
      .then(res => {
        const arr = res.data?.kycs || [];
        setKycs(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {})
      .finally(() => setLoadingKyc(false));

    // Users total
    getAllUsers()
      .then(res => {
        setTotalUsers(res.data?.total ?? (res.data?.users?.length ?? 0));
      })
      .catch(() => {});

    // Widget stats (transactions, PAYO, referrals)
    getDashboardWidgetStats()
      .then(res => {
        const d = res.data || {};
        setTotalTxns(d.totalTransactions ?? 0);
        setPayoCirculation(d.payoInCirculation ?? 0);
        setReferralRewards(d.referralRewardsDistributed ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoadingWidgets(false));

    // KYC dashboard stats (donut + active wallets)
    getDashboardStats()
      .then(res => {
        const s = res.data?.stats || {};
        setStats(s);
        setActiveWallets(s.approved || 0);
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoadingStats(false));
  }, []);

  const totalSubmissions = stats?.totalSubmissions || 0;
  const pendingKYC = (stats?.underReview || 0) + (stats?.docsUploaded || 0);
  const approvedKYC = stats?.approved || 0;
  const rejectedKYC = stats?.rejected || 0;

  // Filter KYC list by date
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

  const widgetLoading = loadingWidgets || loadingStats;

  return {
    // state
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
    // derived
    totalSubmissions,
    pendingKYC,
    approvedKYC,
    rejectedKYC,
    filteredKyc,
    // actions
    setDateFilter,
  };
}