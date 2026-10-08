import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'ClubSphere — Smart Club Operations';
    const category = searchParams.get('category') || 'TECH FESTIVAL';
    const fest = searchParams.get('fest') || '9th DRMC International Tech Carnival 2026';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#030712',
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.12) 0%, rgba(3, 7, 18, 1) 70%)',
            padding: '56px 64px',
            fontFamily: 'sans-serif',
            border: '1px solid #1e293b',
          }}
        >
          {/* Top Bar: Brand & Category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: '1px solid #1e293b',
              paddingBottom: '28px',
            }}
          >
            {/* Brand Monogram & Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#f8fafc',
                    letterSpacing: '-1px',
                  }}
                >
                  <span style={{ color: '#a855f7' }}>C</span>S
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#f8fafc',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  ClubSphere
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#64748b',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  DRMC Operations
                </span>
              </div>
            </div>

            {/* Category Capsule */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#a855f7',
                }}
              />
              <span>{category}</span>
            </div>
          </div>

          {/* Center Main Stage: Popping Typography */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 'auto 0',
              padding: '24px 0',
            }}
          >
            {fest ? (
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {fest}
              </div>
            ) : null}

            <div
              style={{
                fontSize: title.length > 40 ? '58px' : '68px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.12,
                letterSpacing: '-1.5px',
                maxWidth: '1060px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom Bar: Minimal Brand Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #1e293b',
              paddingTop: '24px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <span>Smart Club Operations &amp; Event Platform</span>
            </div>

            <div
              style={{
                fontSize: '13px',
                color: '#94a3b8',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              clubsphere.drmc.edu.bd
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);
    return new Response('Failed to generate OpenGraph image', { status: 500 });
  }
}
