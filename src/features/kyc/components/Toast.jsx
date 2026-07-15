// src/features/kyc/components/Toast.jsx
export function Toast({ msg, type }) {
  return <div className={`toast ${type === 'ok' ? 'ok' : 'err'}`}>
    {type === 'ok' ? '✅' : '❌'} {msg}
  </div>;
}