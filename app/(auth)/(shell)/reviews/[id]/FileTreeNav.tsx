'use client'

type FileEntry = {
  fp: string
  filename: string
  dot: string
  count: number
}

export default function FileTreeNav({
  entries,
  totalFiles,
  filesWithFindings,
}: {
  entries: FileEntry[]
  totalFiles: number
  filesWithFindings: number
}) {
  return (
    <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 20 }}>
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid var(--border)',
        fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Files ({entries.length})
      </div>
      {entries.map(({ fp, filename, dot, count }) => (
        <div
          key={fp}
          title={fp}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 12px', borderBottom: '1px solid rgba(34,197,94,0.05)',
            fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)',
            cursor: 'pointer', transition: 'background 0.1s',
            overflow: 'hidden',
          }}
          className="file-tree-item"
          onClick={() => {
            document
              .getElementById(`file-${fp.replace(/[^a-z0-9]/gi, '-')}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{filename}</span>
          <span style={{ fontSize: 9, color: 'var(--text-dim)', flexShrink: 0 }}>{count}</span>
        </div>
      ))}
      {totalFiles > filesWithFindings && (
        <div style={{ padding: '7px 12px', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
          +{totalFiles - filesWithFindings} clean
        </div>
      )}
    </div>
  )
}
