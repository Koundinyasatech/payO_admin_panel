import { useState } from 'react';

export function useAuditLog() {
  // Feature temporarily unavailable – backend no longer provides audit log endpoint.
  const [loading] = useState(false);
  const [error] = useState('Audit Log feature is currently unavailable.');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [filtered] = useState([]);
  const [counts] = useState({ All: 0, approve: 0, reject: 0, info: 0 });

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