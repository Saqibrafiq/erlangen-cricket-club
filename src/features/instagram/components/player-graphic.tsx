import { PALETTE } from '../palette'

export type PlayerGraphicBodyProps = {
  firstName: string | null
  lastName: string
  /** Board office or playing role, when recorded. */
  role: string | null
  /** The cut-out photo as a PNG data URI; `null` shows the initials. */
  photoSrc: string | null
  initials: string
}

/** A squad member: the cut-out player standing on the bottom edge, name across the left. */
export function PlayerGraphicBody({
  firstName,
  lastName,
  role,
  photoSrc,
  initials,
}: PlayerGraphicBodyProps) {
  return (
    <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          right: -80,
          // Down past the footer row, so the player stands on the bottom edge of the image.
          bottom: -136,
          width: 760,
          height: 860,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only.
          <img src={photoSrc} alt="" style={{ height: 860, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              display: 'flex',
              fontFamily: 'Barlow Condensed',
              fontWeight: 700,
              fontSize: 420,
              color: PALETTE.watermark,
            }}
          >
            {initials}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 12,
          paddingBottom: 40,
          maxWidth: 520,
        }}
      >
        {role && (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '10px 28px',
              borderRadius: 999,
              fontSize: 30,
              fontWeight: 500,
              backgroundColor: PALETTE.textOnMedia,
              color: PALETTE.mediaOverlay,
            }}
          >
            {role}
          </div>
        )}
        {firstName && (
          <div
            style={{ display: 'flex', fontSize: 52, letterSpacing: 8, textTransform: 'uppercase' }}
          >
            {firstName}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Barlow Condensed',
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}
        >
          {lastName}
        </div>
      </div>
    </div>
  )
}
