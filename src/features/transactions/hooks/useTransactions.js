import { useState, useEffect, useCallback, useRef } from 'react';
import { getTransactions, exportTransactions } from '../../../api/adminApi';

const PAGE_SIZE = 10;

export function useTransactions() {
  const [txns, setTxns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fDate, setFDate] = useState('all');
  const [fWallet, setFWallet] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Debounce search
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedWallet, setDebouncedWallet] = useState('');

  const handleSearchChange = v => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400);
  };
  const handleWalletChange = v => {
    setFWallet(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedWallet(v); setPage(1); }, 400);
  };

  const combinedSearch = debouncedSearch || debouncedWallet;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page, limit: PAGE_SIZE };
    if (fStatus !== 'all') params.status = fStatus;
    if (fDate !== 'all') params.dateFilter = fDate;
    if (combinedSearch) params.search = combinedSearch;

    getTransactions(params)
      .then(res => {
        const data = res.data;
        setTxns(Array.isArray(data?.transactions) ? data.transactions : []);
        setSummary(data?.summary || null);
        setTotalRows(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(err => {
        console.error('Transactions fetch failed:', err);
        setError(err.response?.data?.message || 'Failed to load transactions. Please try again.');
        setTxns([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [page, fStatus, fDate, combinedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [fStatus, fDate]);

  const activeFilters = (fStatus !== 'all' ? 1 : 0) + (fDate !== 'all' ? 1 : 0) + (fWallet ? 1 : 0) + (search ? 1 : 0);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const params = { format };
      if (fStatus !== 'all') params.status = fStatus;
      if (fDate !== 'all') params.dateFilter = fDate;
      if (combinedSearch) params.search = combinedSearch;

      const response = await exportTransactions(params);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'csv' ? 'transactions.csv' : 'transactions.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return {
    // state
    txns,
    summary,
    loading,
    error,
    totalRows,
    totalPages,
    search,
    fStatus,
    fDate,
    fWallet,
    page,
    exporting,
    activeFilters,
    // derived
    totalTxns: summary?.totalTransactions ?? totalRows,
    succCount: summary?.successCount ?? 0,
    pendCount: summary?.pendingCount ?? 0,
    failCount: summary?.failedCount ?? 0,
    volume: summary?.totalVolume ?? 0,
    successRate: summary?.successRate ?? '—',
    // actions
    setSearch,
    setFStatus,
    setFDate,
    setFWallet,
    setPage,
    handleSearchChange,
    handleWalletChange,
    fetchData,
    handleExport,
    setExporting,
  };
}