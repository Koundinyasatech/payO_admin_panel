import { useState, useEffect } from 'react';
import { getUserTransactions, getUserReferralDetails } from '../../../api/adminApi';
import { getUserBankDetails } from '../../../api/walletApi';

export function UserModal({ user, onClose }) {
  const [tab, setTab] = useState('details');
  const [txns, setTxns] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [bankData, setBankData] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);

  // --- data fetching effects ---
  useEffect(() => {
    if (!user || tab !== 'transactions') return;
    setTxnLoading(true);
    getUserTransactions(user._id)
      .then(res => {
        const arr = res.data?.transactions || [];
        setTxns(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setTxns([]))
      .finally(() => setTxnLoading(false));
  }, [tab, user]);

  useEffect(() => {
    if (!user || tab !== 'referral') return;
    setReferralLoading(true);
    getUserReferralDetails(user._id)
      .then(res => setReferralData(res.data?.referral || null))
      .catch(() => setReferralData(null))
      .finally(() => setReferralLoading(false));
  }, [tab, user]);

  useEffect(() => {
    if (!user || tab !== 'bank') return;
    setBankLoading(true);
    getUserBankDetails(user._id)
      .then(res => setBankData(res.data?.bankDetails || null))
      .catch(() => setBankData(null))
      .finally(() => setBankLoading(false));
  }, [tab, user]);

  // --- early return if no user ---
  if (!user) return null;

  // --- render your modal JSX here using the state variables ---
  return (
    <div className="modal">
      {/* your existing modal UI */}
      <button onClick={onClose}>Close</button>
      {/* you can use txns, referralData, bankData, etc. */}
    </div>
  );
}