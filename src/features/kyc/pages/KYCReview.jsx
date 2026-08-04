// src/features/kyc/pages/KYCReview.jsx
import { useKYC } from '../hooks/useKYC';
import { SearchBar } from '../components/SearchBar';
import { StatusFilterDropdown } from '../components/StatusFilterDropdown';
import { KYCTable } from '../components/KYCTable';
import { ReviewModal } from '../components/ReviewModal';
import { RejectModal } from '../components/RejectModal';

export default function KYCReview() {
  const {
    loading,
    fStatus,
    search,
    page,
    selectedUser,
    rejectTarget,
    rejectReason,
    counts,
    pagedData,
    totalPages,
    perPage,
    canApproveReject,
    setFStatus,
    setSearch,
    setPage,
    setSelectedUser,
    setRejectTarget,
    setRejectReason,
    loadData,
    approve,
    reject,
    quickApprove,
    quickReject,
    submitQuickReject,
  } = useKYC();

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .auto-refresh-label {
          font-size: 12px;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .auto-refresh-label .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>KYC Review</h2>
          <p>Review all submitted identity documents. Approve or reject individual documents.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="auto-refresh-label">
            <span className="dot" /> Auto-refresh
          </span>
          <button className="btn btn-outline" onClick={loadData} style={{ fontSize: 13 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Total</div>
              <div className="stat-value" style={{ fontSize: 26 }}>
                {loading ? '—' : counts.All}
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#E0F2FE', fontSize: 22 }}>📋</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ fontSize: 26, color: '#D97706' }}>
                {loading ? '—' : counts.Pending}
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#FEF3C7', fontSize: 22 }}>⏳</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Approved</div>
              <div className="stat-value" style={{ fontSize: 26, color: '#059669' }}>
                {loading ? '—' : counts.Approved}
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#D1FAE5', fontSize: 22 }}>✅</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Rejected</div>
              <div className="stat-value" style={{ fontSize: 26, color: '#DC2626' }}>
                {loading ? '—' : counts.Failed}
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#FEE2E2', fontSize: 22 }}>❌</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} />
          <StatusFilterDropdown value={fStatus} onChange={setFStatus} counts={counts} />
          <div className="filter-count">{pagedData.length} results</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Documents Submitted</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <KYCTable
              data={pagedData}
              loading={loading}
              onReview={setSelectedUser}
            />
          </table>
          {!loading && pagedData.length === 0 && (
            <div className="empty">No KYC requests match your filters.</div>
          )}
        </div>

        {!loading && (
          <div className="pagination">
            <div className="pag-info">
              Showing {Math.min((page - 1) * perPage + 1, pagedData.length)}–{Math.min(page * perPage, pagedData.length)} of {pagedData.length}
            </div>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pag-btn${page === i + 1 ? ' act' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedUser && (
        <ReviewModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={approve}
          onReject={reject}
          canApproveReject={canApproveReject}
        />
      )}

      {/* Quick Reject Modal */}
      {rejectTarget && (
        <RejectModal
          targetId={rejectTarget}
          reason={rejectReason}
          setReason={setRejectReason}
          onConfirm={submitQuickReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}