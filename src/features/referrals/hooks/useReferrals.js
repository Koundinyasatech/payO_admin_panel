

import { useState, useEffect, useRef } from 'react';
import { getReferrals } from '../../../api/adminApi';

const PAGE_SIZE = 12; // Must match the UI page size

export function useReferrals() {
  const [referrers, setReferrers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fStatus, setFStatus] = useState('all');

  const searchTimer = useRef(null);
  const handleSearchChange = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 400);
  };

  // ─── Fetch data (only when search changes, not on page change) ──
  // If your backend supports pagination, you should send page & limit.
  // But our backend currently ignores them – we'll fallback to client‑side pagination.
  const fetchData = () => {
    setLoading(true);
    setError('');

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;

    getReferrals(params)
      .then((res) => {
        const data = res.data?.Data || {};
        const list = data.referral_list || [];

        // Store the full unfiltered list
        setReferrers(list);

        // Summary stats from top‑level fields
        setSummary({
          totalReferrals: data.total_referrals ?? 0,
          totalRewardsDistributed: data.total_bonus_awarded ?? 0,
          topReferrers: list.length
            ? [list.reduce((a, b) => a.total_referrals > b.total_referrals ? a : b)]
            : [],
        });

        // totalRows is the total filtered count (after client‑side filtering)
        // We'll compute that later
      })
      .catch((err) => {
        console.error('Referrals fetch failed:', err);
        setError(err.response?.data?.Message || 'Failed to load referrals. Please try again.');
        setReferrers([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  };

  // Fetch when search changes (only)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ─── Client‑side filtering ──────────────────────────────────────
  const filtered = (() => {
    if (fStatus === 'all') return referrers;
    if (fStatus === 'active') {
      return referrers.filter((r) => (r.user_status || '').toUpperCase() === 'ACTIVE');
    }
    return referrers.filter((r) => (r.user_status || '').toUpperCase() !== 'ACTIVE');
  })();

  // ─── Client‑side pagination (slice) ────────────────────────────
  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  if (page !== safePage) setPage(safePage);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedList = filtered.slice(start, end);

  // ─── Derived stats ──────────────────────────────────────────────
  const totalReferrals = summary?.totalReferrals ?? 0;
  const rewardsDistributed = summary?.totalRewardsDistributed ?? 0;
  const topReferrers = summary?.topReferrers ?? [];
  const pendingCount = 0; // adjust if you have pending status

  const activeFilters = (fStatus !== 'all' ? 1 : 0) + (search ? 1 : 0);

  return {
    referrals: referrers,
    summary,
    loading,
    error,
    totalRows: totalFiltered,          // used in pagination info
    totalPages,
    page: safePage,
    search,
    fStatus,
    debouncedSearch,
    exporting,
    activeFilters,
    totalReferrals,
    rewardsDistributed,
    topReferrers,
    pendingCount,
    filtered: paginatedList,           // the list for the current page
    pageSize: PAGE_SIZE,               // expose for UI
    setPage,
    setSearch,
    setFStatus,
    handleSearchChange,
    fetchData,
    setExporting,
  };
}