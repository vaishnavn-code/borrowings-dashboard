/**
 * components/layout/Sidebar.jsx
 * ==============================
 * Left navigation sidebar.
 */

import React, { useMemo } from 'react'
import { NAV_PAGES } from '../../utils/constants'
import FSlogo from '../../data/images/FSlogo.png'

const NAV_ICONS = {
  overview: (
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  ),

  portfolioMix: (
    <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99z" />
  ),

  costAnalysis: (
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  ),

  rateTrends: (
    <path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-7.09 8-4-4L2 17l1.5 1.5z" />
  ),

  maturityAnalysis: (
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-2-9h-5v5h5v-5z" />
  ),

  counterparties: (
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  ),

  transactions: (
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  ),
}

export default function Sidebar({ activePage, onNavigate }) {
  const sections = useMemo(() => {
    const map = {}
    NAV_PAGES.forEach((p) => {
      if (!map[p.section]) map[p.section] = []
      map[p.section].push(p)
    })
    return map
  }, [])

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <img src={FSlogo} alt="FS Logo" style={{ width: 40, height: 40, borderRadius: 9 }} />
        <div>
          <div style={styles.logoText}>Borrowings DASHBOARD</div>
          <div style={styles.logoSub}>A Product by Fourth Signal</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {Object.entries(sections).map(([section, pages], idx) => (
          <div key={section}>
            {idx > 0 && <div style={styles.divider} />}
            <div style={styles.sectionLabel}>{section}</div>
            {pages.map((p) => {
              const isActive = activePage === p.id
              return (
                <button
                  key={p.id}
                  style={{ ...styles.navBtn, ...(isActive ? styles.navBtnActive : {}) }}
                  onClick={() => onNavigate(p.id)}
                >
                  <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" style={{ flexShrink: 0 }}>
                    {NAV_ICONS[p.id] || NAV_ICONS.overview}
                  </svg>
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'var(--white)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 24px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    boxShadow: '2px 0 12px rgba(21,101,192,.07)',
    transition: 'background .4s'
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '22px 18px 20px',
    borderBottom: '1px solid var(--border)',
    marginBottom: 12
  },
  logoText: { fontSize: '1rem', fontWeight: 700, color: 'var(--blue-dark)' },
  logoSub: {
    fontSize: '.40rem',
    fontWeight: 600,
    letterSpacing: '.2em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: 2
  },
  sectionLabel: {
    fontSize: '.57rem',
    fontWeight: 800,
    letterSpacing: '.18em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    padding: '4px 14px 2px'
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 3, padding: '0 10px', flex: 1 },
  navBtn: {
    fontFamily: 'var(--font)',
    fontSize: '.79rem',
    fontWeight: 500,
    padding: '9px 14px',
    borderRadius: 9,
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--text-muted)',
    transition: 'all .2s',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 9
  },
  navBtnActive: {
    background: 'var(--blue-pale)',
    color: 'var(--blue-dark)',
    fontWeight: 700,
    boxShadow: 'inset 0 0 0 1px var(--blue-light)'
  },
  divider: { height: 1, background: 'var(--border)', margin: '10px 16px' }
}
