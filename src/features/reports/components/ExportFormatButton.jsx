export function ExportFormatButton({ format, isLoading, isDone, onClick }) {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 6px',
        borderRadius: 11,
        border: `1.5px solid ${isDone ? '#86EFAC' : format.border}`,
        background: isDone ? '#DCFCE7' : format.bg,
        color: isDone ? '#15803D' : format.color,
        fontWeight: 700,
        fontSize: 13,
        cursor: isLoading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        transition: 'all 0.15s',
        opacity: isLoading ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        if (!isLoading && !isDone) {
          e.currentTarget.style.background = format.hoverBg;
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = format.hoverBg;
        }
      }}
      onMouseLeave={e => {
        if (!isLoading && !isDone) {
          e.currentTarget.style.background = format.bg;
          e.currentTarget.style.color = format.color;
          e.currentTarget.style.borderColor = format.border;
        }
      }}
    >
      {isLoading ? (
        <>
          <span style={{ width: 13, height: 13, border: `2px solid ${format.color}40`, borderTopColor: format.color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          <span>...</span>
        </>
      ) : isDone ? (
        <>✓ Done</>
      ) : (
        <>{format.icon} {format.label}</>
      )}
    </button>
  );
}