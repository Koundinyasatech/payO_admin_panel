// src/components/Skeleton.jsx
export function Skeleton({ w = '100%', h = 16, radius = 6, style = {} }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        ...style,
      }}
    />
  );
}