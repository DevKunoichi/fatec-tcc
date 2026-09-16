import React from 'react';

const Header = () => {
  return (
    <>
      <div style={{ height: '9px', background: '#16295B' }}></div>
      <header style={{ background: '#1B4BA0', color: '#FFFFFF', padding: '0 40px' }}>
        <div style={{ maxWidth: '1520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '66px', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
            <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em' }}>CINE NOVELINO</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10.5px', letterSpacing: '.18em', color: '#AFC2E6', textTransform: 'uppercase' }}>
              Gerenciamento integrado
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11.5px', color: '#AFC2E6' }}>
              Franca · SP · 02/09/2026
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '26px', borderLeft: '1px solid rgba(255,255,255,.3)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: '#1B4BA0', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.04em' }}>
                AP
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Andresa Paula</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: '#AFC2E6', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Gerente
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
