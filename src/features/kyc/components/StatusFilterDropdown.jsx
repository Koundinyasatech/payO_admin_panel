// src/features/kyc/components/StatusFilterDropdown.jsx
import { useState, useRef, useEffect } from 'react';

export function StatusFilterDropdown({ value, onChange, counts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const options = [
    { label:'All', value:'All', dot:'#94A3B8' },
    { label:'Pending', value:'Pending', dot:'#D97706' },
    { label:'In Review', value:'In Review', dot:'#2563EB' },
    { label:'Approved', value:'Approved', dot:'#059669' },
    { label:'Failed', value:'Failed', dot:'#DC2626' },
  ];
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', background:open?'#EEF2FF':'var(--filter-btn-bg,#F5F3FF)', border:'1.5px solid var(--filter-btn-border,#C7D2FE)', borderRadius:10, color:'var(--filter-btn-color,#4F46E5)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filters {value!=='All'&&<span style={{ background:'#4F46E5', color:'#fff', borderRadius:20, padding:'1px 6px', fontSize:10, fontWeight:700 }}>1</span>}
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform:open?'rotate(180deg)':'none' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--dropdown-bg,#fff)', border:'1.5px solid var(--dropdown-border,#E2E8F0)', borderRadius:12, padding:'6px', minWidth:200, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:500 }}>
          <div style={{ padding:'6px 12px 8px', fontSize:10.5, fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.8px' }}>Filter by Status</div>
          {options.map(opt => (
            <div key={opt.value} onClick={()=>{onChange(opt.value);setOpen(false);}}
              style={{ padding:'9px 12px', borderRadius:8, fontSize:13, fontWeight:value===opt.value?600:400, color:value===opt.value?'#4F46E5':'var(--dropdown-text,#374151)', background:value===opt.value?'#EEF2FF':'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:9 }}
              onMouseEnter={e=>{if(value!==opt.value)e.currentTarget.style.background='var(--dropdown-hover,#F9FAFB)';}}
              onMouseLeave={e=>{if(value!==opt.value)e.currentTarget.style.background='transparent';}}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:opt.dot, display:'inline-block', flexShrink:0 }}/>
              <span style={{ flex:1 }}>{opt.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:value===opt.value?'#4F46E5':'var(--gray-400)', background:value===opt.value?'#E0E7FF':'var(--gray-100)', padding:'1px 7px', borderRadius:20 }}>{counts[opt.value]??0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}