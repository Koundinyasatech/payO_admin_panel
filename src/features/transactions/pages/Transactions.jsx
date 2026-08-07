import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { StatCard } from '../components/StatCard';
import { TxnModal } from '../components/TxnModal';
import { DateDropdown } from '../components/DateDropdown';
import { getType, getStatus, formatDate, truncateWallet } from '../utils/helpers';

// Local Skeleton (or import from shared)
function Skeleton({ w = '100%', h = 14, r = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,var(--skeleton-a,#E2E8F0) 25%,var(--skeleton-b,#F1F5F9) 50%,var(--skeleton-a,#E2E8F0) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style,
    }} />
  );
}

export default function Transactions() {
  const {
    txns,
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
    totalTxns,
    succCount,
    pendCount,
    failCount,
    volume,
    successRate,
    setSearch,
    setFStatus,
    setFDate,
    setFWallet,
    setPage,
    handleSearchChange,
    handleWalletChange,
    fetchData,
    handleExport
  } = useTransactions();

  const [sel, setSel] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const PAGE_SIZE = 10;

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .txn-row { transition: background 0.15s; }
        .txn-row:hover { background: var(--txn-row-hover, #F0F7FF) !important; }
        body.dark { --txn-row-hover: #1a2235; }
        .txn-type-icon { transition: transform 0.2s; }
        .txn-row:hover .txn-type-icon { transform: scale(1.12) rotate(-4deg); }
        .status-tab { padding: 11px 18px; border: none; background: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif; color: var(--gray-400); border-bottom: 2.5px solid transparent; transition: all 0.18s; white-space: nowrap; }
        .status-tab.act { color: #2563EB; border-bottom-color: #2563EB; }
        .status-tab:hover:not(.act) { color: var(--navy); }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="page-header-left">
          <h2>Transactions</h2>
          <p>Track all PYO token transfers and referral rewards.</p>
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
                  <button onClick={() => { handleExport('csv'); setShowExportMenu(false); }} style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}>
                    Export CSV
                  </button>
                  <button onClick={() => { handleExport('excel'); setShowExportMenu(false); }} style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}>
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
          label="Total Transactions" value={totalTxns.toLocaleString()}
          sub={`${volume.toLocaleString()} PYO total volume`}
          icon={<svg width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>}
          iconBg="rgba(59,130,246,0.12)" color="#3B82F6" loading={loading}
        />
        <StatCard
          label="Successful" value={succCount.toLocaleString()}
          sub={`${successRate} success rate`}
          icon={<svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
          iconBg="rgba(16,185,129,0.12)" color="#10B981" loading={loading}
        />
        <StatCard
          label="Pending" value={pendCount.toLocaleString()}
          sub="Awaiting confirmation"
          icon={<svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          iconBg="rgba(245,158,11,0.12)" color="#D97706" loading={loading}
        />
        <StatCard
          label="Failed" value={failCount.toLocaleString()}
          sub="Requires attention"
          icon={<svg width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
          iconBg="rgba(239,68,68,0.12)" color="#DC2626" loading={loading}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="card">

        {/* Status tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', paddingLeft: 8, overflowX: 'auto' }}>
          {[
            { key: 'all', label: 'All', count: totalTxns },
            { key: 'success', label: 'Success', count: succCount },
            { key: 'pending', label: 'Pending', count: pendCount },
            { key: 'failed', label: 'Failed', count: failCount },
          ].map(tab => (
            <button
              key={tab.key}
              className={`status-tab${fStatus === tab.key ? ' act' : ''}`}
              onClick={() => { setFStatus(tab.key); setPage(1); }}
            >
              {tab.label}
              <span style={{
                marginLeft: 7, borderRadius: 20, padding: '2px 8px',
                fontSize: 11, fontWeight: 700,
                background: fStatus === tab.key ? '#DBEAFE' : 'var(--gray-100)',
                color: fStatus === tab.key ? '#2563EB' : 'var(--gray-400)',
              }}>
                {loading ? '—' : tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="search-field" style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
            <svg width="13" height="13" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search Transaction ID…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="search-field" style={{ flex: 1, minWidth: 200, maxWidth: 280 }}>
            <svg width="13" height="13" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 3H8L4 7h16l-4-4z" />
            </svg>
            <input
              placeholder="Filter by wallet address…"
              value={fWallet}
              onChange={e => handleWalletChange(e.target.value)}
            />
          </div>

          <DateDropdown value={fDate} onChange={v => { setFDate(v); setPage(1); }} />

          {activeFilters > 0 && (
            <button
              className="btn btn-outline"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => {
                setSearch('');
                setFStatus('all');
                setFDate('all');
                setFWallet('');
                setPage(1);
                // also clear debounced
                handleSearchChange('');
                handleWalletChange('');
              }}
            >
              Clear ({activeFilters})
            </button>
          )}

          <div className="filter-count">
            {!loading && <><strong style={{ color: 'var(--navy)' }}>{totalRows}</strong> transaction{totalRows !== 1 ? 's' : ''}</>}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(PAGE_SIZE).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Skeleton w={32} h={32} r={9} /><div><Skeleton w={100} h={12} r={4} /><Skeleton w={55} h={9} r={4} style={{ marginTop: 5 }} /></div></div></td>
                    <td><Skeleton w={120} h={12} r={4} /></td>
                    <td><Skeleton w={120} h={12} r={4} /></td>
                    <td><Skeleton w={90} h={16} r={4} /></td>
                    <td><Skeleton w={70} h={22} r={20} /></td>
                    <td><Skeleton w={110} h={12} r={4} /></td>
                    <td><Skeleton w={60} h={28} r={20} style={{ margin: '0 auto' }} /></td>
                  </tr>
                ))
                : txns.map((t, idx) => {
                  const tc = getType(t);
                  const sc = getStatus(t.status);
                  const txId = t.transactionId || '—';
                  const sender = t.senderWallet || '—';
                  const recvr = t.receiverWallet || '—';
                  const amt = Math.abs(t.amount ?? 0);

                  return (
                    <tr
                      key={txId + idx}
                      className="txn-row"
                      style={{ animation: `rowFadeIn 0.3s ease both`, animationDelay: `${idx * 0.04}s` }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="txn-type-icon"
                            style={{
                              width: 34, height: 34, borderRadius: 10,
                              background: tc.grad, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 15, color: '#fff', fontWeight: 900,
                              boxShadow: `0 2px 10px ${tc.glow}`,
                            }}
                          >
                            {tc.icon}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>
                              #{String(txId).slice(-12)}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--gray-400)', marginTop: 1 }}>
                              {tc.label}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-600)', display: 'block' }} title={sender}>
                            {sender === 'REFERRAL_BONUS' ? (
                              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                REFERRAL BONUS
                              </span>
                            ) : truncateWallet(sender)}
                          </span>
                          {t.senderName && (
                            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.senderName}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-600)', display: 'block' }} title={recvr}>
                            {truncateWallet(recvr)}
                          </span>
                          {t.receiverName && (
                            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.receiverName}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: tc.credit ? '#059669' : '#2563EB' }}>
                            {tc.credit ? '+' : ''}{amt.toLocaleString()}
                          </span>
                          <span style={{ background: 'var(--gray-100)', fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', padding: '2px 6px', borderRadius: 6 }}>
                            PYO
                          </span>
                        </div>
                      </td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td style={{ fontSize: 12.5, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {formatDate(t.createdAt)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSel(t); }}
                          style={{
                            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                            background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
                            border: 'none', color: '#fff',
                            fontSize: 12, fontWeight: 600,
                            fontFamily: "'Inter',sans-serif",
                            boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
                            transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.28)'; }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>

          {!loading && txns.length === 0 && !error && (
            <div className="empty">
              <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
              <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15, marginBottom: 6 }}>
                {activeFilters > 0 ? 'No transactions match your filters' : 'No transactions yet'}
              </div>
              <div style={{ fontSize: 13 }}>
                {activeFilters > 0
                  ? 'Try adjusting the date range, status, or wallet address.'
                  : 'Transactions will appear here once users start transacting on the platform.'}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <div className="pag-info">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalRows)}–{Math.min(page * PAGE_SIZE, totalRows)} of {totalRows} transactions
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

      {/* Detail Modal */}
      {sel && <TxnModal txn={sel} onClose={() => setSel(null)} />}
    </div>
  );
}