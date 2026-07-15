import { useState, useEffect } from 'react';
import { getTransactionDetails } from '../../../api/adminApi';
import { CopyField } from './CopyField';
import { getType, getStatus, formatDate } from '../utils/helpers';

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

function useCopy() {
  const [copied, setCopied] = useState('');
  const copy = (val, key) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    }).catch(() => {});
  };
  return [copied, copy];
}

export function TxnModal({ txn, onClose }) {
  const [copied, copy] = useCopy();
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    if (!txn?.transactionId) { setDetailLoading(false); return; }
    setDetailLoading(true);
    getTransactionDetails(txn.transactionId)
      .then(res => setDetail(res.data?.transaction || null))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [txn?.transactionId]);

  if (!txn) return null;

  const tc = getType(txn);
  const sc = getStatus(txn.status);
  const amt = Math.abs(txn.amount ?? 0);
  const txId = txn.transactionId || '—';
  const hash = detail?.blockchainHash || '';
  const sender = txn.senderWallet || '—';
  const recvr = txn.receiverWallet || '—';
  const senderName = detail?.sender?.name || txn.senderName || null;
  const recvrName = detail?.receiver?.name || txn.receiverName || null;
  const ts = formatDate(txn.createdAt, true);

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-head" style={{ padding: '20px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15, background: tc.grad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#fff', fontWeight: 900, flexShrink: 0,
              boxShadow: `0 6px 20px ${tc.glow}`,
            }}>
              {tc.icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Transaction Detail</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--gray-400)' }}>
                  #{String(txId).slice(-12)}
                </span>
                <span className={`badge ${sc.cls}`}>{sc.label}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Amount hero */}
        <div style={{
          margin: '0 20px 4px', borderRadius: 16,
          background: tc.credit
            ? 'linear-gradient(135deg,#022c22,#065F46)'
            : 'linear-gradient(135deg,#1c0101,#7F1D1D)',
          padding: '22px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
              {tc.credit ? 'Reward Amount' : 'Transfer Amount'}
            </div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
              {tc.credit ? '+' : ''}{amt.toLocaleString()}
              <span style={{ fontSize: 16, opacity: 0.4, marginLeft: 10, fontWeight: 600, letterSpacing: 0 }}>PYO</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 0 }}>
              {[
                ['Type', tc.label],
                ['Status', sc.label],
                ['Date', txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
              ].map(([l, v], i, a) => (
                <div key={l} style={{ paddingRight: 20, marginRight: 20, borderRight: i < a.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  <div style={{ fontSize: 9, opacity: 0.45, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.95, textTransform: 'capitalize' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail fields */}
        <div className="modal-body" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
            Transaction Data
          </div>

          <div style={{ borderRadius: 13, border: '1.5px solid var(--gray-200)', overflow: 'hidden' }}>
            {[
              {
                label: 'Transaction ID',
                content: <CopyField val={txId} copyId="txid" copied={copied} onCopy={copy} />,
              },
              {
                label: 'Blockchain Hash',
                content: detailLoading ? (
                  <Skeleton w={200} h={14} r={4} />
                ) : hash ? (
                  <div>
                    <CopyField val={hash} copyId="hash" copied={copied} onCopy={copy} truncate />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }} />
                      <span style={{ fontSize: 10.5, color: '#059669', fontWeight: 600 }}>Confirmed on-chain</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ fontSize: 12.5, color: 'var(--gray-400)' }}>Pending blockchain confirmation</span>
                  </div>
                ),
              },
              {
                label: 'Sender Wallet',
                content: (
                  <div>
                    <CopyField val={sender === 'REFERRAL_BONUS' ? 'REFERRAL_BONUS' : sender} copyId="sender" copied={copied} onCopy={copy} truncate />
                    {senderName && (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>{senderName}</div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Receiver Wallet',
                content: (
                  <div>
                    <CopyField val={recvr} copyId="recvr" copied={copied} onCopy={copy} truncate />
                    {recvrName && (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>{recvrName}</div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Amount',
                content: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: tc.credit ? '#059669' : '#2563EB' }}>
                      {tc.credit ? '+' : ''}{amt.toLocaleString()}
                    </span>
                    <span style={{ background: tc.credit ? '#DCFCE7' : '#DBEAFE', color: tc.credit ? '#15803D' : '#1D4ED8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      PYO
                    </span>
                    {txn.failureReason && (
                      <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 500, marginLeft: 4 }}>
                        — {txn.failureReason}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                label: 'Timestamp',
                content: <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>{ts}</span>,
              },
            ].map(({ label, content }, i, arr) => (
              <div
                key={label}
                style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr',
                  padding: '13px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--gray-200)' : 'none',
                  background: i % 2 === 0 ? 'var(--gray-100,#F8FAFC)' : '#fff',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.7px', paddingTop: 2 }}>
                  {label}
                </div>
                <div>{content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}