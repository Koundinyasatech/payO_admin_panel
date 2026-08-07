
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useReferrals } from '../hooks/useReferrals';
import { useBonusSchemes } from '../hooks/useBonusSchemes';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../../../components/Skeleton';
import { formatDate, statusBadge } from '../utils/helpers';
import { BonusSchemesTable } from '../components/BonusSchemesTable';
import { BonusSchemeModal } from '../components/BonusSchemeModal';
import { ConfirmModal } from '../components/ConfirmModal';

export default function Referrals() {
  // ─── Referrals tab state ──────────────────────────────────────────────
  const {
    loading: refLoading,
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
    setExporting,
    pageSize, // ✅ added – now pagination works
  } = useReferrals();

  // ─── Bonus Schemes tab state ──────────────────────────────────────────
  const {
    schemes,
    loading: schemesLoading,
    stats: schemesStats,
    fetchSchemes,
    createScheme,
    updateScheme,
    deleteScheme,
    activateScheme,
    deactivateScheme,
  } = useBonusSchemes();

  const [activeTab, setActiveTab] = useState('referrals');
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemesSearch, setSchemesSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ─── Confirmation modal state ──────────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // 🔍 Search filter for schemes
  const filteredSchemes = useMemo(() => {
    if (!schemesSearch.trim()) return schemes;
    const query = schemesSearch.toLowerCase().trim();
    return schemes.filter(
      (s) =>
        s.scheme_name?.toLowerCase().includes(query) ||
        s.scheme_code?.toLowerCase().includes(query)
    );
  }, [schemes, schemesSearch]);

  // ─── Handlers for Bonus Schemes ──────────────────────────────────────
  const handleAddScheme = () => {
    setEditingScheme(null);
    setShowSchemeModal(true);
  };

  const handleEditScheme = (scheme) => {
    setEditingScheme(scheme);
    setShowSchemeModal(true);
  };

  const handleDeleteScheme = (schemeCode) => {
    setPendingAction({ type: 'delete', schemeCode });
    setShowConfirmModal(true);
  };

  const handleToggleStatus = (schemeCode, newStatus) => {
    setPendingAction({ type: 'toggle', schemeCode, newStatus });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === 'delete') {
        await deleteScheme(pendingAction.schemeCode);
        toast.success('Scheme deactivated successfully');
      } else if (pendingAction.type === 'toggle') {
        if (pendingAction.newStatus) {
          await activateScheme(pendingAction.schemeCode);
          toast.success('Scheme activated successfully');
        } else {
          await deactivateScheme(pendingAction.schemeCode);
          toast.success('Scheme deactivated successfully');
        }
      }
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (err) {
      toast.error(err.response?.data?.Message || err.message || 'Action failed');
    }
  };

  const handleSaveScheme = async (formData) => {
    try {
      if (editingScheme) {
        await updateScheme(editingScheme.scheme_code, formData);
        toast.success('Bonus scheme updated successfully!');
      } else {
        await createScheme(formData);
        toast.success('Bonus scheme created successfully!');
      }
      setShowSchemeModal(false);
      setEditingScheme(null);
    } catch (err) {
      toast.error(err.response?.data?.Message || err.message || 'Failed to save scheme');
    }
  };

  // ─── Export ──────────────────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const rows = [
        ['Referrer Name', 'Referral Code', 'Total Referrals', 'Total Bonus Awarded ', 'Status', 'Joined At'],
        ...filtered.map((r) => [
          r.full_name || '—',
          r.referral_code || '—',
          r.total_referrals ?? 0,
          r.total_bonus_awarded ?? 0,
          r.user_status || '—',
          r.created_on ? new Date(r.created_on).toLocaleDateString('en-IN') : '—',
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
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

  const loading = activeTab === 'referrals' ? refLoading : schemesLoading;

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ref-row { transition: background 0.15s; }
        .ref-row:hover { background: var(--ref-row-hover,#F5F3FF) !important; }
        body.dark { --ref-row-hover: #1a1a2e; }
        .tab-btn { padding: 11px 20px; border: none; background: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif; color: var(--gray-400); border-bottom: 2.5px solid transparent; transition: all 0.18s; white-space: nowrap; }
        .tab-btn.act { color: #7C3AED; border-bottom-color: #7C3AED; }
        .tab-btn:hover:not(.act) { color: var(--navy); }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="page-header-left">
          <h2>Referral Management</h2>
          <p>Track and manage all platform referrals, rewards, and bonus schemes.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {activeTab === 'referrals' && !loading && (
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
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    minWidth: 160,
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => handleExport('csv')}
                    style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    style={{ width: '100%', padding: '12px', border: 'none', background: '#fff', cursor: 'pointer' }}
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'schemes' && (
            <button className="btn btn-primary" onClick={handleAddScheme}>
              ➕ Add Scheme
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={activeTab === 'referrals' ? fetchData : fetchSchemes}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Error Banner ── */}
      {error && !loading && activeTab === 'referrals' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: 12,
            padding: '13px 18px',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>{error}</span>
          </div>
          <button
            onClick={fetchData}
            style={{
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: 22 }}>
        <button
          className={`tab-btn ${activeTab === 'referrals' ? 'act' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          📋 Referrals
          <span
            style={{
              marginLeft: 7,
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              background: activeTab === 'referrals' ? '#EDE9FE' : 'var(--gray-100)',
              color: activeTab === 'referrals' ? '#7C3AED' : 'var(--gray-400)',
            }}
          >
            {refLoading ? '—' : totalRows}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'schemes' ? 'act' : ''}`}
          onClick={() => {
            setActiveTab('schemes');
            fetchSchemes();
          }}
        >
          🎁 Bonus Schemes
          <span
            style={{
              marginLeft: 7,
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              background: activeTab === 'schemes' ? '#EDE9FE' : 'var(--gray-100)',
              color: activeTab === 'schemes' ? '#7C3AED' : 'var(--gray-400)',
            }}
          >
            {schemesLoading ? '—' : schemes.length}
          </span>
        </button>
      </div>

      {/* ─── Tab Content ── */}
      {activeTab === 'referrals' ? (
        /* ─── Referrals Tab ── */
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
            <StatCard
              label="Total Referrals"
              value={totalReferrals.toLocaleString()}
              sub="All-time referrals"
              icon={
                <svg width="20" height="20" fill="none" stroke="#7C3AED" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              }
              iconBg="rgba(124,58,237,0.12)"
              color="#7C3AED"
              loading={refLoading}
            />
            <StatCard
              label="Rewards Distributed"
              value={`${rewardsDistributed.toLocaleString()} `}
              sub="Total rewards paid out"
              icon={
                <svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              iconBg="rgba(245,158,11,0.12)"
              color="#D97706"
              loading={refLoading}
            />
           
          
          </div>

          {/* Main Table Card */}
          <div className="card">
            {/* Status tabs – filter on user_status */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', paddingLeft: 8, overflowX: 'auto' }}>
              {[
                { key: 'all', label: 'All', count: totalRows },
                { key: 'active', label: 'Active', count: filtered.filter((r) => (r.user_status || '').toUpperCase() === 'ACTIVE').length },
                { key: 'inactive', label: 'Inactive', count: filtered.filter((r) => (r.user_status || '').toUpperCase() !== 'ACTIVE').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className="ref-tab"
                  style={{
                    padding: '11px 18px',
                    border: 'none',
                    background: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif',
                    color: fStatus === tab.key ? '#7C3AED' : 'var(--gray-400)',
                    borderBottom: fStatus === tab.key ? '2.5px solid #7C3AED' : '2.5px solid transparent',
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => {
                    setFStatus(tab.key);
                    setPage(1);
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      marginLeft: 7,
                      borderRadius: 20,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      background: fStatus === tab.key ? '#EDE9FE' : 'var(--gray-100)',
                      color: fStatus === tab.key ? '#7C3AED' : 'var(--gray-400)',
                    }}
                  >
                    {refLoading ? '—' : tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div className="filter-bar" style={{ gap: 10, flexWrap: 'wrap' }}>
              <div className="search-field" style={{ flex: 1, minWidth: 240, maxWidth: 380 }}>
                <svg width="13" height="13" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Search by referrer name or code…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {activeFilters > 0 && (
                <button
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => {
                    setSearch('');
                    setFStatus('all');
                    setPage(1);
                  }}
                >
                  Clear ({activeFilters})
                </button>
              )}

              <div className="filter-count">
                {!refLoading && (
                  <>
                    <strong style={{ color: 'var(--navy)' }}>{filtered.length}</strong> referral
                    {filtered.length !== 1 ? 's' : ''}
                  </>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Referrer</th>
                    <th># Referrals</th>
                    <th>Code Used</th>
                    <th>Reward </th>
                    <th>Status</th>
                    <th>Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {refLoading
                    ? Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Skeleton w={34} h={34} r="50%" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  <Skeleton w={120} h={13} r={4} />
                                </div>
                              </div>
                            </td>
                            <td><Skeleton w={40} h={16} r={4} /></td>
                            <td><Skeleton w={80} h={22} r={6} /></td>
                            <td><Skeleton w={60} h={16} r={4} /></td>
                            <td><Skeleton w={70} h={22} r={20} /></td>
                            <td><Skeleton w={110} h={12} r={4} /></td>
                          </tr>
                        ))
                    : filtered.map((r, idx) => {
                        const sb = statusBadge(r.user_status);
                        return (
                          <tr
                            key={idx}
                            className="ref-row"
                            style={{ animation: `rowFadeIn 0.3s ease both`, animationDelay: `${idx * 0.04}s` }}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    color: '#fff',
                                    fontWeight: 800,
                                    flexShrink: 0,
                                    boxShadow: '0 2px 8px rgba(109,40,217,0.3)',
                                  }}
                                >
                                  {(r.full_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>
                                    {r.full_name || '—'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
                                {r.total_referrals ?? 0}
                              </span>
                            </td>
                            <td>
                              {r.referral_code ? (
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    background: '#EDE9FE',
                                    color: '#5B21B6',
                                    padding: '3px 10px',
                                    borderRadius: 8,
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {r.referral_code}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--gray-400)' }}>—</span>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontFamily: "'Space Grotesk',sans-serif",
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: '#D97706',
                                }}
                              >
                                +{(r.total_bonus_awarded ?? 0).toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${sb.cls}`}>{sb.label}</span>
                            </td>
                            <td style={{ fontSize: 12.5, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                              {formatDate(r.created_on)}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>

              {!refLoading && filtered.length === 0 && !error && (
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
            {!refLoading && topReferrers.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-200)' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--gray-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: 12,
                  }}
                >
                  Top Referrers
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {topReferrers.slice(0, 5).map((tr, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'var(--gray-100,#F8FAFC)',
                        border: '1.5px solid var(--gray-200)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        flex: '1 1 180px',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background:
                            [
                              'linear-gradient(135deg,#F59E0B,#FCD34D)',
                              'linear-gradient(135deg,#9CA3AF,#D1D5DB)',
                              'linear-gradient(135deg,#B45309,#D97706)',
                              'linear-gradient(135deg,#6D28D9,#7C3AED)',
                              'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                            ][i] || 'linear-gradient(135deg,#6D28D9,#7C3AED)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--navy)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tr.name || '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                          {tr.totalReferrals} referral{tr.totalReferrals !== 1 ? 's' : ''} ·{' '}
                          {(tr.totalEarnings ?? 0).toLocaleString()} 
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!refLoading && totalPages > 1 && (
              <div className="pagination">
                <div className="pag-info">
                  Showing {Math.min((page - 1) * pageSize + 1, totalRows)}–
                  {Math.min(page * pageSize, totalRows)} of {totalRows} referrals
                </div>
                <div className="pag-btns">
                  <button
                    className="pag-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p =
                      totalPages <= 7
                        ? i + 1
                        : page <= 4
                        ? i + 1
                        : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                    return (
                      <button
                        key={p}
                        className={`pag-btn${page === p ? ' act' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    className="pag-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ─── Bonus Schemes Tab ── */
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <StatCard
              label="Total Schemes"
              value={schemesStats?.total || 0}
              sub="All bonus schemes"
              icon={
                <svg width="20" height="20" fill="none" stroke="#7C3AED" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              }
              iconBg="rgba(124,58,237,0.12)"
              color="#7C3AED"
              loading={schemesLoading}
            />
            <StatCard
              label="Active"
              value={schemesStats?.active || 0}
              sub="Currently active"
              icon={
                <svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
              iconBg="rgba(16,185,129,0.12)"
              color="#059669"
              loading={schemesLoading}
            />
            <StatCard
              label="Total Redemptions"
              value={(schemesStats?.totalRedemptions || 0).toLocaleString()}
              sub="Across all schemes"
              icon={
                <svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              iconBg="rgba(245,158,11,0.12)"
              color="#D97706"
              loading={schemesLoading}
            />
            <StatCard
              label="Expired"
              value={schemesStats?.expired || 0}
              sub="No longer valid"
              icon={
                <svg width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
              iconBg="rgba(239,68,68,0.12)"
              color="#DC2626"
              loading={schemesLoading}
            />
          </div>

          {/* Table Card with Search Filter */}
          <div
            className="card"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              className="filter-bar"
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F3F4F6',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div
                className="search-field"
                style={{ flex: 1, minWidth: '240px', maxWidth: '380px', position: 'relative' }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Search by scheme name or code…"
                  value={schemesSearch}
                  onChange={(e) => setSchemesSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border 0.15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                  <strong style={{ color: '#111827' }}>{filteredSchemes.length}</strong> schemes
                  {schemesSearch && ` (filtered from ${schemes.length})`}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setSchemesSearch('')}
                  style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scheme Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bonus</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <BonusSchemesTable
                  data={filteredSchemes}
                  loading={schemesLoading}
                  onEdit={handleEditScheme}
                  onDelete={handleDeleteScheme}
                  onToggleStatus={handleToggleStatus}
                />
              </table>
              {!schemesLoading && filteredSchemes.length === 0 && (
                <div className="empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{schemesSearch ? '🔍' : '🎁'}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>
                    {schemesSearch ? 'No schemes match your search' : 'No bonus schemes found'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    {schemesSearch
                      ? `Try adjusting your search term "${schemesSearch}"`
                      : 'Create your first bonus scheme to start rewarding users.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── Modals ── */}
      {showSchemeModal && (
        <BonusSchemeModal
          scheme={editingScheme}
          onSave={handleSaveScheme}
          onClose={() => {
            setShowSchemeModal(false);
            setEditingScheme(null);
          }}
        />
      )}

      {/* ─── Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          pendingAction?.type === 'toggle'
            ? pendingAction.newStatus
              ? 'Activate Scheme'
              : 'Deactivate Scheme'
            : 'Deactivate Scheme'
        }
        message={
          pendingAction?.type === 'toggle'
            ? `Are you sure you want to ${pendingAction.newStatus ? 'activate' : 'deactivate'} this scheme?`
            : 'This will deactivate the scheme and it will no longer be available. You can reactivate it later.'
        }
        confirmText={
          pendingAction?.type === 'toggle'
            ? pendingAction.newStatus
              ? 'Activate'
              : 'Deactivate'
            : 'Deactivate'
        }
        type={
          pendingAction?.type === 'toggle'
            ? pendingAction.newStatus
              ? 'info'
              : 'warning'
            : 'danger'
        }
      />
    </div>
  );
}