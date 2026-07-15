// src/features/kyc/pages/KYCReview.jsx
import { useKYC } from '../hooks/useKYC';
import { SearchBar } from '../components/SearchBar';
import { StatusFilterDropdown } from '../components/StatusFilterDropdown';
import { KYCTable } from '../components/KYCTable';
import { ReviewModal } from '../components/ReviewModal';
import { RejectModal } from '../components/RejectModal';
import { Toast } from '../components/Toast';

export default function KYCReview() {
  const {
    loading,
    fStatus,
    search,
    page,
    toast,
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="page-header">
        <div className="page-header-left">
          <h2>KYC Review</h2>
          <p>Review all submitted identity documents. Approve or reject user KYC requests.</p>
        </div>
        <button className="btn btn-outline" onClick={loadData} style={{ fontSize:13 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} />
          <StatusFilterDropdown value={fStatus} onChange={setFStatus} counts={counts} />
          <div className="filter-count">{pagedData.length} results</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Documents Submitted</th><th>Submitted On</th><th>Status</th><th>Actions</th></tr></thead>
            <KYCTable
              data={pagedData}
              loading={loading}
              onReview={setSelectedUser}
              onApprove={quickApprove}
              onReject={quickReject}
              canApproveReject={canApproveReject}
            />
          </table>
          {!loading && pagedData.length === 0 && <div className="empty">No KYC requests match your filters.</div>}
        </div>

        {!loading && (
          <div className="pagination">
            <div className="pag-info">Showing {Math.min((page-1)*perPage+1, pagedData.length)}–{Math.min(page*perPage, pagedData.length)} of {pagedData.length}</div>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i+1} className={`pag-btn${page === i+1 ? ' act' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button className="pag-btn" disabled={page===totalPages} onClick={() => setPage(p => p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <ReviewModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={approve}
          onReject={reject}
          canApproveReject={canApproveReject}
        />
      )}

      {rejectTarget && (
        <RejectModal
          targetId={rejectTarget}
          reason={rejectReason}
          setReason={setRejectReason}
          onConfirm={submitQuickReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="toast-stack">{toast && <Toast msg={toast.msg} type={toast.type}/>}</div>
    </div>
  );
}