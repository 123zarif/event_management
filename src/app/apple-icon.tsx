import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          borderRadius: '40px',
          border: '4px solid #1e293b',
        }}
      >
        <span
          style={{
            fontSize: '76px',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '-2px',
          }}
        >
          <span style={{ color: '#a855f7' }}>C</span>S
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
