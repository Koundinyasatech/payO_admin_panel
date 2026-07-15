// src/features/kyc/hooks/useKYC.js
import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../../../App';
import { getAllSubmissions, approveKYC, rejectKYC } from '../../../api/kyc.api';
import { normalizeStatus } from '../utils/normalizeStatus';
import { getInitials } from '../utils/getInitials';
import { COLORS } from '../utils/constants';

export function useKYC() {
  const { confirm, adminRole } = useContext(AppCtx);
  const canApproveReject = ['super_admin', 'kyc_admin'].includes(adminRole);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStatus, setFStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadData = () => {
    setLoading(true);
    getAllSubmissions()
      .then(res => {
        const arr = res.data?.kycs || [];
        const enriched = (Array.isArray(arr) ? arr : []).map((r, idx) => ({
          ...r,
          _normalStatus: normalizeStatus(r.status),
          _initials: getInitials(r.fullName || r.userId?.name || '?'),
          _color: COLORS[idx % COLORS.length],
        }));
        setData(enriched);
      })
      .catch(() => showToast('Failed to load KYC submissions', 'err'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    try {
      await approveKYC(id);
      setData(prev => prev.map(r => r._id === id ? { ...r, status: 'approved', _normalStatus: 'Approved' } : r));
      setSelectedUser(null);
      showToast('KYC Approved — Wallet activated!', 'ok');
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed', 'err');
    }
  };

  const reject = async (id, reason) => {
    try {
      await rejectKYC(id, reason);
      setData(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected', _normalStatus: 'Failed', rejectionReason: reason } : r));
      setSelectedUser(null);
      showToast('KYC Rejected. User notified.', 'err');
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed', 'err');
    }
  };

  const quickApprove = (id) => {
    const user = data.find(r => r._id === id);
    const name = user?.fullName || user?.userId?.name || 'this user';
    confirm({
      title: 'Approve KYC',
      message: `Are you sure you want to approve KYC for ${name}? Their wallet will be activated.`,
      confirmLabel: '✅ Yes, Approve',
      cancelLabel: 'Cancel',
      type: 'success',
    }, () => approve(id));
  };

  const quickReject = (id) => {
    setRejectTarget(id);
    setRejectReason('');
  };

  const submitQuickReject = () => {
    if (!rejectReason.trim()) return;
    reject(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason('');
  };

  const counts = {
    All: data.length,
    Pending: data.filter(r => r._normalStatus === 'Pending').length,
    'In Review': data.filter(r => r._normalStatus === 'In Review').length,
    Approved: data.filter(r => r._normalStatus === 'Approved').length,
    Failed: data.filter(r => r._normalStatus === 'Failed').length,
  };

  const filtered = data.filter(r => {
    const matchStatus = fStatus === 'All' || r._normalStatus === fStatus;
    const name = r.fullName || r.userId?.name || '';
    const id = r._id || '';
    const mobile = r.userId?.mobile || '';
    const email = r.userId?.email || '';
    const q = search.toLowerCase();
    const matchSearch = !search
      || name.toLowerCase().includes(q)
      || String(id).toLowerCase().includes(q)
      || mobile.toLowerCase().includes(q)
      || email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedData = filtered.slice((page - 1) * perPage, page * perPage);

  return {
    // state
    data,
    loading,
    fStatus,
    search,
    page,
    toast,
    selectedUser,
    rejectTarget,
    rejectReason,
    counts,
    filtered,
    pagedData,
    totalPages,
    perPage,
    canApproveReject,

    // actions
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
    showToast,
  };
}