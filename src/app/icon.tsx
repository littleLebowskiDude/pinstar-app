import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#DC2626',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '12px',
              background: 'white',
              borderRadius: '2px 2px 0 0',
            }}
          />
          <div
            style={{
              width: '4px',
              height: '12px',
              background: 'white',
              marginTop: '0px',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
