// src/features/kyc/components/DocumentCard.jsx
import { useState, useEffect } from 'react';
import { normalizeDocUrl } from '../utils/normalizeDocUrl';
export function DocumentCard({ title, emoji, url, accentColor, accentBg, flagged }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const present = !!url;

  useEffect(() => {
    if (!url) return;
    let revoked = false;
    setLoading(true);
    setImgError(false);
    setBlobUrl(null);

    const normalized = normalizeDocUrl(url);

    fetch(normalized, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        const ct = res.headers.get('content-type') || '';
        if (!revoked) setIsPdf(ct.includes('pdf') || normalized.toLowerCase().endsWith('.pdf'));
        return res.blob();
      })
      .then(blob => {
        if (!revoked) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => { if (!revoked) setImgError(true); })
      .finally(() => { if (!revoked) setLoading(false); });

    return () => {
      revoked = true;
      setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [url]);

  const openFullView = () => {
    if (!url) return;
    window.open(blobUrl || normalizeDocUrl(url), '_blank', 'noopener,noreferrer');
  };

  // … (rest of JSX is identical, refer to original)
  // For brevity, I'm pasting the full JSX here:
  return (
    <div style={{
      border: `2px solid ${flagged ? '#FECACA' : present ? accentColor + '33' : 'var(--gray-200)'}`,
      borderRadius: 14,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: present ? `0 2px 14px ${accentColor}12` : 'none',
    }}>
      <div
        onClick={openFullView}
        style={{
          background: flagged ? '#FEE2E2' : accentBg,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6,
          cursor: present ? 'pointer' : 'not-allowed',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {present && loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, border:'3px solid rgba(255,255,255,0.3)', borderTopColor:accentColor, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Loading...</div>
          </div>
        )}
        {present && !loading && blobUrl && !isPdf && (
          <img src={blobUrl} alt={title} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block' }} />
        )}
        {present && !loading && blobUrl && isPdf && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:42 }}>📄</div>
            <div style={{ fontSize:11, fontWeight:700, color:accentColor, textTransform:'uppercase', letterSpacing:'0.6px' }}>PDF — Click Open</div>
          </div>
        )}
        {(!present || (!loading && !blobUrl)) && (
          <>
            <div style={{
              width:54, height:54, borderRadius:14,
              background:'rgba(255,255,255,0.6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
            }}>{present ? '⚠️' : emoji}</div>
            <div style={{
              fontSize:11, fontWeight:700,
              color: present ? '#DC2626' : 'rgba(0,0,0,0.35)',
              textTransform:'uppercase', letterSpacing:'0.6px',
            }}>
              {present ? 'Preview unavailable — click Open' : 'Not uploaded'}
            </div>
          </>
        )}
        {present && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 10, fontWeight: 600,
            padding: '3px 8px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{title}</span>
        </div>
        {present
          ? flagged
            ? <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>⚠️ Flagged</span>
            : blobUrl
              ? <span style={{ background: '#F0FDF4', color: '#059669', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>Submitted ✓</span>
              : <span style={{ background: '#FFF7ED', color: '#D97706', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>Submitted ✓</span>
          : <span style={{ background: 'var(--gray-100)', color: 'var(--gray-400)', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>Not uploaded</span>}
      </div>
    </div>
  );
}