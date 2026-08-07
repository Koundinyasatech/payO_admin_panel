import React from "react";

const SectionDivider = ({
  icon,
  label,
  background,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--navy)",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          flex: 1,
          height: 1,
          background: "var(--gray-200)",
        }}
      />
    </div>
  );
};

export default React.memo(SectionDivider);