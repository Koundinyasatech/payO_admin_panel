import { useAuditLog } from '../hooks/useAuditLog';
import { Skeleton } from '../components/Skeleton';
import { AuditItem } from '../components/AuditItem';
import { FilterChips } from '../components/FilterChips';

export default function AuditLog() {
  const {
    loading,
    error,
    filter,
    search,
    counts,
    filtered,
    setFilter,
    setSearch,
  } = useAuditLog();

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Audit Log</h2>
          <p>Complete history of all admin actions and system events.</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.print()}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Export
        </button>
      </div>

      <FilterChips current={filter} counts={counts} onChange={setFilter} />

      <div className="card">
        <div className="filter-bar">
          <div className="search-field">
            <svg width="14" height="14" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search by user, admin, or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-count">{filtered.length} records</div>
        </div>

        {error && (
          <div style={{ padding: '16px 20px', color: '#DC2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <div>
          {loading
            ? Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="audit-item">
                    <Skeleton w={36} h={36} radius={10} />
                    <div style={{ flex: 1 }}>
                      <Skeleton w="60%" h={14} radius={4} style={{ marginBottom: 6 }} />
                      <Skeleton w="80%" h={10} radius={4} />
                    </div>
                    <Skeleton w={80} h={10} radius={4} />
                  </div>
                ))
            : filtered.map(log => <AuditItem key={log._id || Math.random()} log={log} />)}

          {!loading && filtered.length === 0 && (
            <div className="empty">No audit records found.</div>
          )}
        </div>
      </div>
    </div>
  );
}