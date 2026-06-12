export default function ShellLoading() {
  return (
    <div className="page-shell" style={{ animation: 'none' }}>
      {/* Page header skeleton */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={skeletonStyle(80, 12)} />
          <div style={skeletonStyle(200, 22)} />
        </div>
      </div>

      {/* Main content skeleton — two-column card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={skeletonStyle(100, 14)} />
              <div style={skeletonStyle(60, 14)} />
            </div>
            <div style={skeletonStyle('100%', 32)} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={skeletonStyle(120, 14)} />
          <div style={skeletonStyle(80, 30, 6)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={skeletonStyle(24, 24, 4)} />
              <div style={skeletonStyle('40%', 13)} />
              <div style={{ flex: 1 }} />
              <div style={skeletonStyle(80, 13)} />
              <div style={skeletonStyle(60, 22, 20)} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skel {
          background: linear-gradient(
            90deg,
            var(--surface2) 25%,
            var(--surface)  50%,
            var(--surface2) 75%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 4px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

function skeletonStyle(
  width: number | string,
  height: number,
  borderRadius = 4
): React.CSSProperties {
  return {
    width: typeof width === 'number' ? width : width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--surface2) 25%, var(--surface) 50%, var(--surface2) 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.4s infinite linear',
    flexShrink: 0,
  }
}
