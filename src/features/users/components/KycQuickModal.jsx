import { useState, useEffect } from 'react';
import { getUserKycDocs } from '../../../api/adminApi';
import { getUserBankDetails } from '../../../api/walletApi';

export function KycQuickModal({ user, onClose }) {
  const [kycDocs, setKycDocs] = useState(null);
  const [bankLive, setBankLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getUserKycDocs(user._id).then(res => res.data?.kyc || null).catch(() => null),
      getUserBankDetails(user._id).then(res => res.data?.bankDetails || null).catch(() => null),
    ]).then(([kyc, bank]) => {
      setKycDocs(kyc);
      setBankLive(bank);
    }).finally(() => setLoading(false));
  }, [user]);

  // ... rest of the component JSX (same as original, using kycDocs and bankLive)
}