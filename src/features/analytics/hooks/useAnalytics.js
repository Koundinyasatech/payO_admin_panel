import { useState, useEffect } from 'react';
import { getAllSubmissions } from '../../../api/kyc.api';
import { normalizeStatus, MONTH_ORDER } from '../utils/helpers';

export function useAnalytics() {
  const [allKyc, setAllKyc] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSubmissions()
      .then(res => {
        const arr = res.data?.kycs || [];
        setAllKyc(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute derived stats from the list
  const total = allKyc.length || 1;
  const approved = allKyc.filter(r => r.status === 'approved').length;
  const rejected = allKyc.filter(r => r.status === 'rejected').length;
  const underReview = allKyc.filter(r => r.status === 'under_review').length;
  const docsUploaded = allKyc.filter(r => r.status === 'documents_uploaded').length;
  const notStarted = allKyc.filter(r => r.status === 'not_started').length;
  const pending = underReview + docsUploaded + notStarted;
  const successRate = ((approved / total) * 100).toFixed(1);
  const rejectionRate = ((rejected / total) * 100).toFixed(1);

  // Monthly aggregation
  const monthlyMap = {};
  allKyc.forEach(r => {
    const date = new Date(r.createdAt || Date.now());
    const key = date.toLocaleString('en-IN', { month: 'short' });
    if (!monthlyMap[key]) monthlyMap[key] = { approved: 0, pending: 0, rejected: 0 };
    const st = normalizeStatus(r.status);
    if (st === 'Approved') monthlyMap[key].approved++;
    else if (st === 'Pending' || st === 'In Review') monthlyMap[key].pending++;
    else monthlyMap[key].rejected++;
  });
  const monthlyData = MONTH_ORDER
    .filter(m => monthlyMap[m])
    .map(m => ({ month: m, ...monthlyMap[m] }));

  // KPI data for cards
  const kpis = [
    {
      label: 'Success Rate',
      value: loading ? '—' : `${successRate}%`,
      change: 'vs all time',
      up: true,
      emoji: '✅',
      bg: '#F0FDF4',
    },
    {
      label: 'Rejection Rate',
      value: loading ? '—' : `${rejectionRate}%`,
      change: 'vs all time',
      up: false,
      emoji: '❌',
      bg: '#FEF2F2',
    },
    {
      label: 'Pending Review',
      value: loading ? '—' : pending.toLocaleString(),
      change: 'awaiting action',
      up: true,
      emoji: '⏱️',
      bg: '#EFF6FF',
    },
    {
      label: 'Total Submissions',
      value: loading ? '—' : total.toLocaleString(),
      change: 'all time',
      up: true,
      emoji: '📋',
      bg: '#FFF7ED',
    },
  ];

  // Distribution data
  const distribution = { approved, pending, rejected, total };

  // Summary items
  const summary = [
    ['Total Users Submitted', total.toLocaleString()],
    ['KYC Approved', `${approved.toLocaleString()} (${successRate}%)`],
    ['KYC Rejected', `${rejected.toLocaleString()} (${rejectionRate}%)`],
    ['Currently Pending', pending.toLocaleString()],
  ];

  return {
    loading,
    kpis,
    monthlyData,
    distribution,
    summary,
  };
}