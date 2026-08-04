// src/features/kyc/hooks/useKYC.js
/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { AppCtx } from '../../../App';
import { getAllSubmissions, approveRejectKYC } from '../../../api/kyc.api';
import { normalizeStatus } from '../utils/normalizeStatus';
import { getInitials } from '../utils/getInitials';
import { COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

// ─── Helper: compute user status from documents ──────────────────────────
function computeUserStatus(documents) {
  if (!documents || documents.length === 0) return 'Pending';
  const statuses = documents.map(d => (d.status || 'Pending').toLowerCase());
  if (statuses.some(s => s === 'approved')) return 'Approved';
  if (statuses.some(s => s === 'rejected' || s === 'failed')) return 'Failed';
  if (statuses.some(s => s === 'under review' || s === 'under_review')) return 'In Review';
  return 'Pending';
}

export function useKYC() {
  const { confirm, adminRole } = useContext(AppCtx);
  const canApproveReject = ['super_admin', 'kyc_admin', 'admin'].includes(adminRole);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStatus, setFStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // ─── Refs for request management ──────────────────────────────────────
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);
  const selectedUserIdRef = useRef(null);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id || selectedUser?.userid || null;
  }, [selectedUser]);

  // ─── Load data ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log('⚠️ Load already in progress, skipping...');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isLoadingRef.current = true;

    setLoading(true);

    try {
      const res = await getAllSubmissions({ signal: controller.signal });

      if (!isMountedRef.current) return;

      // ─── Extract records ──────────────────────────────────────────────
      const records = res.data?.data?.Records || res.data?.kycs || [];

      // ─── Always group by userid ──────────────────────────────────────
      const userMap = new Map();

      records.forEach(r => {
        const userId = r.userid || r.userId || r._id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userid: userId,
            name: r.fullName || r.name || r.userId?.name || 'Unknown',
            mobile: r.mobile || r.userId?.mobile || '',
            email: r.email || r.userId?.email || '',
            documents: [],
            submitted_on: null,
            Wallet_Address: r.Wallet_Address || null,   // ✅ corrected field name
          });
        }
        const user = userMap.get(userId);
        if (r.documents && Array.isArray(r.documents)) {
          user.documents = r.documents;
        } else {
          // Fallback for old API structure
          user.documents.push({
            KYC_doc_id: r.KYC_doc_id || r._id,
            document_type: r.document_type || r.docType || 'UNKNOWN',
            front_image_url: r.front_image_url || r.url || '',
            status: r.status || 'Pending',
            Rejection_Reason: r.Rejection_Reason || r.rejectionReason || 'Not Rejected',
            submitted_on: r.submitted_on || r.createdAt || null,
          });
        }
      });

      // ─── Compute user-level fields ──────────────────────────────────
      const groupedData = Array.from(userMap.values()).map(user => {
        // Submission date: earliest document date
        const dates = user.documents.map(d => d.submitted_on).filter(Boolean);
        if (dates.length > 0) {
          user.submitted_on = dates.reduce((a, b) => new Date(a) < new Date(b) ? a : b);
        }

        // Compute user status from documents
        const userStatus = computeUserStatus(user.documents);

        return {
          ...user,
          status: userStatus,
          _normalStatus: normalizeStatus(userStatus),
          _initials: getInitials(user.name || '?'),
        };
      });

      // ─── Assign colors ──────────────────────────────────────────────
      const enriched = groupedData.map((r, idx) => ({
        ...r,
        _id: String(r.userid || r._id || ''),
        _color: COLORS[idx % COLORS.length],
        documents: r.documents || [],
      }));

      if (isMountedRef.current) {
        setData(enriched);
        // Re‑select the user if one was selected
        const storedId = selectedUserIdRef.current;
        if (storedId) {
          const reSelected = enriched.find(u => u._id === String(storedId) || u.userid === Number(storedId));
          if (reSelected) setSelectedUser(reSelected);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('Request aborted');
        return;
      }
      if (isMountedRef.current) {
        toast.error('Failed to load KYC submissions');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // ─── Auto‑refresh ──────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    let intervalId = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        loadData();
      }, 30000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    loadData();

    if (!document.hidden) {
      startPolling();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadData();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [loadData]);

  // ─── New submission notification ──────────────────────────────────────
  const prevCountRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCountRef.current = data.length;
      return;
    }
    const newCount = data.length;
    const oldCount = prevCountRef.current;
    if (newCount > oldCount) {
      const diff = newCount - oldCount;
      toast.success(`📄 ${diff} new KYC submission${diff > 1 ? 's' : ''} received!`, {
        duration: 5000,
      });
    }
    prevCountRef.current = newCount;
  }, [data]);

  // ─── Helper to find user by docId ──────────────────────────────────
  const findUserByDocId = useCallback((docId, users) => {
    return users.find(user =>
      user.documents.some(doc => Number(doc.KYC_doc_id) === Number(docId))
    );
  }, []);

  // ─── Approve (by docId) ──────────────────────────────────────────────
  const approve = useCallback(async (docId) => {
    if (!docId) {
      toast.error('Invalid document ID');
      return;
    }
    try {
      await approveRejectKYC(Number(docId), 'A');
      setData(prev => {
        const newData = prev.map(user => {
          const updatedDocs = user.documents.map(doc =>
            Number(doc.KYC_doc_id) === Number(docId)
              ? { ...doc, status: 'Approved' }
              : doc
          );
          const newStatus = computeUserStatus(updatedDocs);
          return {
            ...user,
            documents: updatedDocs,
            status: newStatus,
            _normalStatus: normalizeStatus(newStatus),
          };
        });
        const updatedUser = findUserByDocId(docId, newData);
        if (updatedUser) setSelectedUser(updatedUser);
        return newData;
      });
      toast.success('✅ Document approved successfully!');
    } catch (err) {
      if (err.response?.status === 204) {
        setData(prev => {
          const newData = prev.map(user => {
            const updatedDocs = user.documents.map(doc =>
              Number(doc.KYC_doc_id) === Number(docId)
                ? { ...doc, status: 'Approved' }
                : doc
            );
            const newStatus = computeUserStatus(updatedDocs);
            return {
              ...user,
              documents: updatedDocs,
              status: newStatus,
              _normalStatus: normalizeStatus(newStatus),
            };
          });
          const updatedUser = findUserByDocId(docId, newData);
          if (updatedUser) setSelectedUser(updatedUser);
          return newData;
        });
        toast.success('✅ Document approved successfully!');
        return;
      }
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  }, [findUserByDocId]);

  // ─── Reject (by docId) ──────────────────────────────────────────────
  const reject = useCallback(async (docId, reason) => {
    if (!docId) {
      toast.error('Invalid document ID');
      return;
    }
    if (!reason?.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await approveRejectKYC(Number(docId), 'R', reason);
      setData(prev => {
        const newData = prev.map(user => {
          const updatedDocs = user.documents.map(doc =>
            Number(doc.KYC_doc_id) === Number(docId)
              ? { ...doc, status: 'Rejected', Rejection_Reason: reason }
              : doc
          );
          const newStatus = computeUserStatus(updatedDocs);
          return {
            ...user,
            documents: updatedDocs,
            status: newStatus,
            _normalStatus: normalizeStatus(newStatus),
          };
        });
        const updatedUser = findUserByDocId(docId, newData);
        if (updatedUser) setSelectedUser(updatedUser);
        return newData;
      });
      toast.success('❌ Document rejected successfully.');
    } catch (err) {
      if (err.response?.status === 204) {
        setData(prev => {
          const newData = prev.map(user => {
            const updatedDocs = user.documents.map(doc =>
              Number(doc.KYC_doc_id) === Number(docId)
                ? { ...doc, status: 'Rejected', Rejection_Reason: reason }
                : doc
            );
            const newStatus = computeUserStatus(updatedDocs);
            return {
              ...user,
              documents: updatedDocs,
              status: newStatus,
              _normalStatus: normalizeStatus(newStatus),
            };
          });
          const updatedUser = findUserByDocId(docId, newData);
          if (updatedUser) setSelectedUser(updatedUser);
          return newData;
        });
        toast.success('❌ Document rejected successfully.');
        return;
      }
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  }, [findUserByDocId]);

  // ─── Quick actions ──────────────────────────────────────────────────
  const quickApprove = useCallback((userId) => {
    const user = data.find(r => r._id === String(userId) || r.userid === Number(userId));
    if (user) setSelectedUser(user);
  }, [data]);

  const quickReject = useCallback((userId) => {
    const user = data.find(r => r._id === String(userId) || r.userid === Number(userId));
    if (user) setSelectedUser(user);
  }, [data]);

  const submitQuickReject = useCallback(() => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    reject(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason('');
  }, [reject, rejectTarget, rejectReason]);

  // ─── Counts ──────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    All: data.length,
    Pending: data.filter(r => r._normalStatus === 'Pending').length,
    'In Review': data.filter(r => r._normalStatus === 'In Review').length,
    Approved: data.filter(r => r._normalStatus === 'Approved').length,
    Failed: data.filter(r => r._normalStatus === 'Failed').length,
  }), [data]);

  // ─── Filter & Paginate ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter(r => {
      const matchStatus = fStatus === 'All' || r._normalStatus === fStatus;
      const name = r.fullName || r.name || r.userId?.name || '';
      const id = r._id || r.userid || '';
      const mobile = r.userId?.mobile || r.mobile || '';
      const email = r.userId?.email || r.email || '';
      const q = search.toLowerCase();
      const matchSearch = !search
        || name.toLowerCase().includes(q)
        || String(id).toLowerCase().includes(q)
        || mobile.toLowerCase().includes(q)
        || email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [data, fStatus, search]);

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedData = useMemo(() => {
    return filtered.slice((page - 1) * perPage, page * perPage);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [fStatus, search]);

  return {
    data,
    loading,
    fStatus,
    search,
    page,
    selectedUser,
    rejectTarget,
    rejectReason,
    counts,
    filtered,
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
  };
}
/* eslint-enable no-unused-vars */