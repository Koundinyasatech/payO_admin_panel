import { useState } from 'react';
import { useReferrals } from '../hooks/useReferrals';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/Skeleton';
import { formatDate, statusBadge } from '../utils/helpers';

export default function Referrals() {
  const {
    loading,
    error,
    totalRows,
    totalPages,
    page,
    search,
    fStatus,
    exporting,
    activeFilters,
    totalReferrals,
    rewardsDistributed,
    topReferrers,
    pendingCount,
    filtered,
    setPage,
    setSearch,
    setFStatus,
    handleSearchChange,
    fetchData,
    setExporting
  } = useReferrals();

  const [showExportMenu, setShowExportMenu] = useState(false);

  // CSV export (client-side)
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const rows = [
        ['Referrer Name', 'Referrer Email', 'Referral Code', 'Referred User', 'Referred Email', 'Reward (PYO)', 'Status', 'Joined At'],
        ...filtered.map(r => [
          r.referrer?.name || '—',
          r.referrer?.email || '—',
          r.referrer?.referralCode || '—',
          r.referredUser?.name || '—',
          r.referredUser?.email || '—',
          r.rewardAmount ?? 0,
          r.rewardStatus || '—',
          r.referredUser?.joinedAt
            ? new Date(r.referredUser.joinedAt).toLocaleDateString('en-IN')
            : '—',
        ]),
      ];
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'referrals.csv' : 'referrals.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ref-row { transition: background 0.15s; }
        .ref-row:hover { background: var(--ref-row-hover,#F5F3FF) !important; }
        body.dark { --ref-row-hover: #1a1a2e; }
        .ref-tab { padding: 11px 18px; border: none; background: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif; color: var(--gray-400); border-bottom: 2.5px solid transparent; transition: all 0.18s; white-space: nowrap; }
        .ref-tab.act { color: #7C3AED; border-bottom-color: #7C3AED; }
        .ref-tab:hover:not(.act) { color: var(--navy); }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="page-header-left">
          <h2>Referral Management</h2>
          <p>Track and manage all platform referrals and rewards.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!loading && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {exporting ? 'Exporting...' : 'Export'} ▼
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <button onClick={() => handleExport('csv')} style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}>
                    Export CSV
                  </button>
                  <button onClick={() => handleExport('excel')} style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}>
                    Export Excel
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="btn btn-outline" onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '13px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>{error}</span>
          </div>
          <button onClick={fetchData} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <StatCard
          label="Total Referrals" value={totalReferrals.toLocaleString()}
          sub="All-time referrals"
          icon={<svg width="20" height="20" fill="none" stroke="#7C3AED" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>}
          iconBg="rgba(124,58,237,0.12)" color="#7C3AED" loading={loading}
        />
        <StatCard
          label="Rewards Distributed" value={`${rewardsDistributed.toLocaleString()} PYO`}
          sub="Total rewards paid out"
          icon={<svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
          iconBg="rgba(245,158,11,0.12)" color="#D97706" loading={loading}
        />
        <StatCard
          label="Pending Payouts" value={pendingCount.toLocaleString()}
          sub="Awaiting confirmation"
          icon={<svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          iconBg="rgba(245,158,11,0.12)" color="#D97706" loading={loading}
        />
        <StatCard
          label="Top Referrer"
          value={topReferrers.length > 0 ? (topReferrers[0]?.name || '—') : '—'}
          sub={topReferrers.length > 0 ? `${topReferrers[0]?.totalReferrals ?? 0} referrals made` : 'No data yet'}
          icon={<svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
          iconBg="rgba(16,185,129,0.12)" color="#059669" loading={loading}
        />
      </div>

      {/* ── Main Table Card ── */}
      <div className="card">

        {/* Status tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', paddingLeft: 8, overflowX: 'auto' }}>
          {[
            { key: 'all', label: 'All', count: totalRows },
            { key: 'paid', label: 'Paid', count: filtered.filter(r => r.rewardStatus === 'paid').length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'failed', label: 'Failed', count: filtered.filter(r => r.rewardStatus === 'failed').length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`ref-tab${fStatus === tab.key ? ' act' : ''}`}
              onClick={() => { setFStatus(tab.key); setPage(1); }}
            >
              {tab.label}
              <span style={{
                marginLeft: 7, borderRadius: 20, padding: '2px 8px',
                fontSize: 11, fontWeight: 700,
                background: fStatus === tab.key ? '#EDE9FE' : 'var(--gray-100)',
                color: fStatus === tab.key ? '#7C3AED' : 'var(--gray-400)',
              }}>
                {loading ? '—' : tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="search-field" style={{ flex: 1, minWidth: 240, maxWidth: 380 }}>
            <svg width="13" height="13" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search by referrer name or email…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>

          {activeFilters > 0 && (
            <button
              className="btn btn-outline"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => { setSearch(''); setFStatus('all'); setPage(1); }}
            >
              Clear ({activeFilters})
            </button>
          )}

          <div className="filter-count">
            {!loading && (
              <><strong style={{ color: 'var(--navy)' }}>{filtered.length}</strong> referral{filtered.length !== 1 ? 's' : ''}</>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Referred User</th>
                <th>Code Used</th>
                <th>Reward (PYO)</th>
                <th>Status</th>
                <th>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><Skeleton w={120} h={13} r={4} /><Skeleton w={160} h={10} r={4} /></div></td>
                    <td><div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><Skeleton w={120} h={13} r={4} /><Skeleton w={160} h={10} r={4} /></div></td>
                    <td><Skeleton w={80} h={22} r={6} /></td>
                    <td><Skeleton w={60} h={16} r={4} /></td>
                    <td><Skeleton w={70} h={22} r={20} /></td>
                    <td><Skeleton w={110} h={12} r={4} /></td>
                  </tr>
                ))
                : filtered.map((r, idx) => {
                  const sb = statusBadge(r.rewardStatus);
                  return (
                    <tr key={idx} className="ref-row" style={{ animation: `rowFadeIn 0.3s ease both`, animationDelay: `${idx * 0.04}s` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(109,40,217,0.3)',
                          }}>
                            {(r.referrer?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>
                              {r.referrer?.name || '—'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                              {r.referrer?.email || r.referrer?.mobile || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>
                            {r.referredUser?.name || '—'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                            {r.referredUser?.email || r.referredUser?.mobile || '—'}
                          </div>
                        </div>
                      </td>
                      <td>
                        {r.referrer?.referralCode ? (
                          <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, background: '#EDE9FE', color: '#5B21B6', padding: '3px 10px', borderRadius: 8, letterSpacing: '0.5px' }}>
                            {r.referrer.referralCode}
                          </span>
                        ) : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: '#D97706' }}>
                          +{(r.rewardAmount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sb.cls}`}>{sb.label}</span>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {formatDate(r.referredUser?.joinedAt)}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>

          {!loading && filtered.length === 0 && !error && (
            <div className="empty">
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔗</div>
              <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15, marginBottom: 6 }}>
                {activeFilters > 0 ? 'No referrals match your filters' : 'No referrals yet'}
              </div>
              <div style={{ fontSize: 13 }}>
                {activeFilters > 0
                  ? 'Try adjusting your search or status filter.'
                  : 'Referrals will appear here once users start referring others.'}
              </div>
            </div>
          )}
        </div>

        {/* Top Referrers leaderboard */}
        {!loading && topReferrers.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
              Top Referrers
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {topReferrers.slice(0, 5).map((tr, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--gray-100,#F8FAFC)',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 12, padding: '10px 14px', flex: '1 1 180px',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: [
                      'linear-gradient(135deg,#F59E0B,#FCD34D)',
                      'linear-gradient(135deg,#9CA3AF,#D1D5DB)',
                      'linear-gradient(135deg,#B45309,#D97706)',
                      'linear-gradient(135deg,#6D28D9,#7C3AED)',
                      'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                    ][i] || 'linear-gradient(135deg,#6D28D9,#7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tr.name || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                      {tr.totalReferrals} referral{tr.totalReferrals !== 1 ? 's' : ''} · {(tr.totalEarnings ?? 0).toLocaleString()} PYO
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination — server-side */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <div className="pag-info">
              Showing {Math.min((page - 1) * 15 + 1, totalRows)}–{Math.min(page * 15, totalRows)} of {totalRows} referrals
            </div>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                    : page >= totalPages - 3 ? totalPages - 6 + i
                      : page - 3 + i;
                return (
                  <button key={p} className={`pag-btn${page === p ? ' act' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}