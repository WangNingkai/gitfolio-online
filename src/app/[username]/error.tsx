'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h2 style={{ fontSize: '18px' }}>Something went wrong!</h2>
      <p style={{ fontSize: '14px', opacity: 0.7 }}>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: '8px 16px',
          border: '1px solid rgba(128,128,128,0.2)',
          borderRadius: '8px',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
