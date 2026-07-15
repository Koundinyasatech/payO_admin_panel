import { useState, useEffect } from 'react';
import { getAuditLog } from '../../../api/kyc.api';
import { getLogType } from '../utils/helpers';

export function useAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAuditLog()
      .then(res => {
        const arr = res.data?.logs || [];
        setLogs(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setError('Failed to load audit log'))
      .finally(() => setLoading(false));
  }, []);

  const enriched = logs.map(log => ({ ...log, _type: getLogType(log) }));

  const counts = {
    All: enriched.length,
    approve: enriched.filter(l => l._type === 'approve').length,
    reject: enriched.filter(l => l._type === 'reject').length,
    info: enriched.filter(l => l._type === 'info').length,
  };

  const filtered = enriched.filter(log => {
    const matchFilter = filter === 'All' || log._type === filter;
    const q = search.toLowerCase();
    const userName = log.userId?.name || '';
    const userMob = log.userId?.mobile || '';
    const userEmail = log.userId?.email || '';
    const admin = log.reviewedBy?.name || log.reviewedBy?.email || 'Super Admin';
    const reason = log.rejectionReason || '';
    const matchSearch = !search
      || userName.toLowerCase().includes(q)
      || userMob.toLowerCase().includes(q)
      || userEmail.toLowerCase().includes(q)
      || admin.toLowerCase().includes(q)
      || reason.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return {
    loading,
    error,
    filter,
    search,
    counts,
    filtered,
    setFilter,
    setSearch,
  };
}