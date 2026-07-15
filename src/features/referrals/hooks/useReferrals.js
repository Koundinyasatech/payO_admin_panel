import { useState, useEffect, useCallback, useRef } from 'react';
import { getReferrals } from '../../../api/adminApi';

const PAGE_SIZE = 15;

export function useReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fStatus, setFStatus] = useState('all');

  const searchTimer = useRef(null);
  const handleSearchChange = v => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;

    getReferrals(params)
      .then(res => {
        const data = res.data;
        setReferrals(Array.isArray(data?.referrals) ? data.referrals : []);
        setSummary(data?.summary || null);
        setTotalRows(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(err => {
        console.error('Referrals fetch failed:', err);
        setError(err.response?.data?.message || 'Failed to load referrals. Please try again.');
        setReferrals([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side status filter
  const filtered = fStatus === 'all'
    ? referrals
    : referrals.filter(r => String(r.rewardStatus || '').toLowerCase() === fStatus);

  // Stats from summary
  const totalReferrals = summary?.totalReferrals ?? totalRows;
  const rewardsDistributed = summary?.totalRewardsDistributed ?? 0;
  const topReferrers = summary?.topReferrers ?? [];
  const pendingCount = referrals.filter(r => String(r.rewardStatus).toLowerCase() === 'pending').length;

  const activeFilters = (fStatus !== 'all' ? 1 : 0) + (search ? 1 : 0);

  return {
    // state
    referrals,
    summary,
    loading,
    error,
    totalRows,
    totalPages,
    page,
    search,
    fStatus,
    debouncedSearch,
    exporting,
    activeFilters,
    // derived
    totalReferrals,
    rewardsDistributed,
    topReferrers,
    pendingCount,
    filtered,
    // actions
    setPage,
    setSearch,
    setFStatus,
    handleSearchChange,
    fetchData,
    setExporting,
    getReferrals, // for export
  };
}