// src/features/wallets/pages/Wallets.jsx
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useWallets } from '../hooks/useWallets';
import { getPendingPayoDeposits, approveRejectDeposit } from '../../../api/adminApi';

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg,var(--skeleton-a,#E2E8F0) 25%,var(--skeleton-b,#F1F5F9) 50%,var(--skeleton-a,#E2E8F0) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

// ─── Format Date ──────────────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Copy Field ───────────────────────────────────────────────────────────
function CopyField({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-600)' }}>{value}</span>
      <button
        onClick={handleCopy}
        style={{
          background: copied ? '#DCFCE7' : 'var(--gray-100)',
          border: '1px solid ' + (copied ? '#86EFAC' : 'var(--gray-200)'),
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: 10,
          cursor: 'pointer',
          color: copied ? '#15803D' : 'var(--gray-400)',
        }}
      >
        {copied ? '✓' : '📋'}
      </button>
    </span>
  );
}

// ─── Drill‑down Modal (unchanged – kept from previous version) ──────────
function UserDepositsModal({ userId, userName, onClose, isOpen, onActionComplete }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchUserDeposits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingPayoDeposits(userId);
      setDeposits(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deposits');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDeposits();
    } else {
      setDeposits([]);
      setError(null);
      setActionStatus({});
    }
  }, [isOpen, userId, fetchUserDeposits]);

  const totalAmount = deposits.reduce((sum, d) => sum + parseFloat(d.Requested_Amount || 0), 0);

  const handleAction = async (deposit, action) => {
    const isApprove = action === 'approve';
    let rejectReason = '';

    if (!isApprove) {
      rejectReason = window.prompt('Please enter the reason for rejection:');
      if (rejectReason === null) return;
      if (!rejectReason.trim()) {
        toast.error('Rejection reason is required.');
        return;
      }
    }

    const payload = {
      walletAddress: deposit.Wallet_ID,
      gatewayOrderId: deposit.Gateway_Order_Id || deposit.User_Transaction_Id,
      transactionUid: deposit.Transaction_Uid,
      depositUid: deposit.Deposit_Uid,
      depositResponse: isApprove ? 'A' : 'R',
      rejectReason: isApprove ? '' : rejectReason.trim(),
    };

    setActionLoading(deposit.Transaction_Uid);
    try {
      const res = await approveRejectDeposit(payload);

      if (res.status === 204) {
        setActionStatus(prev => ({
          ...prev,
          [deposit.Transaction_Uid]: {
            status: isApprove ? 'approved' : 'rejected',
            message: `Deposit ${isApprove ? 'approved' : 'rejected'} successfully.`,
          },
        }));
        toast.success(`✅ Deposit ${isApprove ? 'approved' : 'rejected'} successfully!`);
        await fetchUserDeposits();
        if (onActionComplete) onActionComplete();
        return;
      }

      if (res.data?.Status === 200 || res.data?.status === 200) {
        setActionStatus(prev => ({
          ...prev,
          [deposit.Transaction_Uid]: {
            status: isApprove ? 'approved' : 'rejected',
            message: res.data?.Message || `Deposit ${isApprove ? 'approved' : 'rejected'} successfully.`,
          },
        }));
        toast.success(res.data?.Message || `Deposit ${isApprove ? 'approved' : 'rejected'} successfully.`);
        await fetchUserDeposits();
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(res.data?.Message || 'Action failed. Please try again.');
      }
    } catch (err) {
      if (err.response?.status === 204) {
        setActionStatus(prev => ({
          ...prev,
          [deposit.Transaction_Uid]: {
            status: isApprove ? 'approved' : 'rejected',
            message: `Deposit ${isApprove ? 'approved' : 'rejected'} successfully.`,
          },
        }));
        toast.success(`✅ Deposit ${isApprove ? 'approved' : 'rejected'} successfully!`);
        await fetchUserDeposits();
        if (onActionComplete) onActionComplete();
        return;
      }

      const msg = err.response?.data?.Message || err.response?.data?.message || err.message || 'Action failed.';
      toast.error(`Error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflow: 'auto',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-actions { display: flex; gap: 6px; justify-content: center; align-items: center; }
        .btn-approve { background: #059669; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; min-width: 70px; }
        .btn-approve:hover:not(:disabled) { background: #047857; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); }
        .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-reject { background: #dc2626; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; min-width: 70px; }
        .btn-reject:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }
        .btn-reject:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-approved { background: #D1FAE5; color: #065F46; }
        .status-rejected { background: #FEE2E2; color: #991B1B; }
        .modal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .modal-table th { text-align: left; padding: 10px 8px; background: #f8fafc; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
        .modal-table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .modal-table tr:hover { background: #fafafa; }
        .summary-bar { background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
      `}</style>

      <div className="modal" style={{ maxWidth: 950, width: '100%', maxHeight: '85vh', background: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#fafafa' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Deposits for {userName}</h3>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>User ID: {userId} • {deposits.length} pending deposits • ₹{totalAmount.toLocaleString('en-IN')} total</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', padding: '4px 8px', borderRadius: 6, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f3f4f6'} onMouseLeave={e => e.target.style.background = 'none'}>✕</button>
        </div>

        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ marginTop: 12, color: '#6b7280' }}>Loading deposits...</div>
            </div>
          ) : error ? (
            <div style={{ color: '#dc2626', padding: 20, textAlign: 'center' }}>⚠️ {error}</div>
          ) : deposits.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📭</div><div>No deposits found for this user.</div></div>
          ) : (
            <>
              <div className="summary-bar">
                <span style={{ fontWeight: 600, color: '#1f2937' }}>Total Pending: <span style={{ color: '#059669' }}>₹{totalAmount.toLocaleString('en-IN')}</span></span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>{deposits.length} transaction{deposits.length > 1 ? 's' : ''} pending</span>
              </div>
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>Wallet ID</th>
                    <th>Transaction</th>
                    <th>Amount</th>
                    <th>Deposit UID</th>
                    <th>Requested On</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => {
                    const isProcessing = actionLoading === d.Transaction_Uid;
                    const status = actionStatus[d.Transaction_Uid]?.status || 'pending';
                    const statusMsg = actionStatus[d.Transaction_Uid]?.message || '';
                    return (
                      <tr key={d.Transaction_Uid}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.Wallet_ID || '—'}</span></td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4b5563' }}>{d.User_Transaction_Id || '—'}</span></td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>₹{parseFloat(d.Requested_Amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{d.Deposit_Uid || '—'}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(d.Created_On)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {status === 'pending' ? (
                            <div className="modal-actions">
                              <button onClick={() => handleAction(d, 'approve')} disabled={isProcessing} className="btn-approve">{isProcessing ? '...' : 'Approve'}</button>
                              <button onClick={() => handleAction(d, 'reject')} disabled={isProcessing} className="btn-reject">{isProcessing ? '...' : 'Reject'}</button>
                            </div>
                          ) : (
                            <span className={`status-badge ${status === 'approved' ? 'status-approved' : status === 'rejected' ? 'status-rejected' : 'status-pending'}`} title={statusMsg}>
                              {status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', flexShrink: 0, background: '#fafafa' }}>
          <button onClick={onClose} style={{ padding: '8px 24px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#1e40af'} onMouseLeave={e => e.target.style.background = '#1a56db'}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function Wallets() {
  const {
    pendingDeposits,
    loading,
    search,
    setSearch,
    error,
    refetch,
  } = useWallets();

  // ─── Polling & Notifications ──────────────────────────────────────────
  const prevCountRef = useRef(pendingDeposits.length);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCountRef.current = pendingDeposits.length;
      return;
    }
    const newCount = pendingDeposits.length;
    const oldCount = prevCountRef.current;
    if (newCount > oldCount) {
      const diff = newCount - oldCount;
      toast.success(`🎉 ${diff} new deposit${diff > 1 ? 's' : ''} received!`, { duration: 5000 });
    }
    prevCountRef.current = newCount;
  }, [pendingDeposits]);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // ─── Group by Userid ──────────────────────────────────────────────────
  const groupedData = useMemo(() => {
    const map = new Map();
    pendingDeposits.forEach(d => {
      const uid = d.Userid;
      if (!map.has(uid)) {
        map.set(uid, {
          Userid: uid,
          Full_Name: d.Full_Name || 'Unknown',
          Wallet_ID: d.Wallet_ID,
          count: 0,
          totalAmount: 0,
          latestDate: null,
          // Store transaction IDs for tooltip (optional)
          transactionIds: [],
        });
      }
      const entry = map.get(uid);
      entry.count += 1;
      entry.totalAmount += parseFloat(d.Requested_Amount || 0);
      entry.transactionIds.push(d.User_Transaction_Id || d.Transaction_Uid);
      if (d.Created_On) {
        const dDate = new Date(d.Created_On);
        if (!entry.latestDate || dDate > new Date(entry.latestDate)) {
          entry.latestDate = d.Created_On;
        }
      }
    });
    return Array.from(map.values());
  }, [pendingDeposits]);

  const filteredGrouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return groupedData;
    return groupedData.filter(g =>
      (g.Full_Name || '').toLowerCase().includes(q) ||
      (g.Wallet_ID || '').toLowerCase().includes(q) ||
      (g.Userid && String(g.Userid).includes(q))
    );
  }, [groupedData, search]);

  // ─── Modal state ──────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (userName, userId) => {
    setSelectedUser(userName);
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleActionComplete = () => refetch();

  if (error) return <div className="error-message">⚠️ {error}</div>;

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: var(--gray-50); }
        .user-name { color: #1a56db; font-weight: 600; text-decoration: underline; }
        .auto-refresh-label { font-size: 12px; color: #6b7280; margin-left: 10px; display: inline-flex; align-items: center; gap: 4px; }
        .auto-refresh-label .dot { display: inline-block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .pending-count-badge { display: inline-block; background: #dbeafe; color: #1e40af; font-weight: 700; padding: 2px 10px; border-radius: 12px; font-size: 13px; text-align: center; min-width: 30px; }
        .pending-count-badge:hover { background: #bfdbfe; cursor: default; }
        .pending-count-tooltip { position: relative; }
        .pending-count-tooltip:hover::after { content: attr(data-tooltip); position: absolute; background: #1f2937; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px; z-index: 10; }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Wallets</h2>
          <p>Monitor pending Payo deposit requests – grouped by user.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="auto-refresh-label"><span className="dot" /> Auto-refresh</span>
          <button className="btn btn-outline" onClick={refetch} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, marginLeft: 12 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Total Pending</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{loading ? '—' : pendingDeposits.length}</div>
            </div>
            <div className="stat-icon" style={{ background: '#FFFBEB', fontSize: 22 }}>⏳</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Unique Users</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{loading ? '—' : groupedData.length}</div>
            </div>
            <div className="stat-icon" style={{ background: '#E0F2FE', fontSize: 22 }}>👥</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Total Amount</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{loading ? '—' : `₹${groupedData.reduce((sum, g) => sum + g.totalAmount, 0).toLocaleString('en-IN')}`}</div>
            </div>
            <div className="stat-icon" style={{ background: '#DCFCE7', fontSize: 22 }}>💰</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">Avg. Per User</div>
              <div className="stat-value" style={{ fontSize: 26 }}>
                {loading || groupedData.length === 0 ? '—' : 
                  `₹${Math.round(groupedData.reduce((sum, g) => sum + g.totalAmount, 0) / groupedData.length).toLocaleString('en-IN')}`}
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#F3E8FF', fontSize: 22 }}>📊</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-field" style={{ flex: 1, maxWidth: 400 }}>
            <svg width="14" height="14" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input placeholder="Search by user name, wallet ID, or user ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-count">{!loading && <><strong>{filteredGrouped.length}</strong> of <strong>{groupedData.length}</strong> users</>}</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Wallet ID</th>
                <th>Total Amount (₹)</th>
                <th>Latest Deposit</th>
                <th style={{ textAlign: 'center' }}>Pending Deposits</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton w={100} h={14} radius={4} /></td>
                    <td><Skeleton w={120} h={14} radius={4} /></td>
                    <td><Skeleton w={80} h={14} radius={4} /></td>
                    <td><Skeleton w={130} h={14} radius={4} /></td>
                    <td><Skeleton w={50} h={14} radius={4} style={{ margin: '0 auto' }} /></td>
                  </tr>
                ))
              ) : filteredGrouped.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty">
                      <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15, marginBottom: 6 }}>{search ? 'No users match your search' : 'No pending deposits'}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{search ? 'Try adjusting your search terms.' : 'All deposits have been processed.'}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGrouped.map((g) => (
                  <tr key={g.Userid} className="clickable-row" onClick={() => handleRowClick(g.Full_Name, g.Userid)}>
                    <td>
                      <span className="user-name">{g.Full_Name}</span>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>ID: {g.Userid}</div>
                    </td>
                    <td><CopyField value={g.Wallet_ID || '—'} /></td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>₹{g.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>{g.latestDate ? formatDate(g.latestDate) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span 
                        className="pending-count-badge pending-count-tooltip" 
                        data-tooltip={g.transactionIds.slice(0, 5).join(', ') + (g.transactionIds.length > 5 ? ` +${g.transactionIds.length - 5} more` : '')}
                      >
                        {g.count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill‑down modal */}
      <UserDepositsModal isOpen={isModalOpen} userId={selectedUserId} userName={selectedUser} onClose={() => setIsModalOpen(false)} onActionComplete={handleActionComplete} />
    </div>
  );
}

// ─── Exported helpers ──────────────────────────────────────────────────────
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function normalizeStatus(s) {
  if (!s) return 'Pending';
  const map = { not_started: 'Pending', documents_uploaded: 'In Review', under_review: 'In Review', approved: 'Approved', rejected: 'Failed' };
  return map[s] || s;
}

export const COLORS = ['#6C63FF','#FF6584','#43E97B','#FA8231','#E74C3C','#3498DB','#9B59B6','#1ABC9C'];