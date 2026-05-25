const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -400px 0 }
    100% { background-position: 400px 0 }
  }
`
const skeletonBg = {
  background: 'linear-gradient(90deg, #f0e8e0 25%, #fdf6f0 50%, #f0e8e0 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 'var(--radius-sm)',
}

export const SkeletonCard = () => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  }}>
    <style>{shimmer}</style>
    <div style={{ height: 180, ...skeletonBg }} />
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ height: 16, width: '80%', ...skeletonBg }} />
      <div style={{ height: 12, width: '50%', ...skeletonBg }} />
      <div style={{ height: 12, width: '60%', ...skeletonBg }} />
    </div>
  </div>
)

export const SkeletonGrid = ({ count = 8 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)