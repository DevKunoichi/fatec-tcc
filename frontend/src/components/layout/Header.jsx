import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const iniciais = user?.nome
    ? user.nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '--';

  return (
    <>
      <div style={{ height: '9px', background: '#16295B' }}></div>
      <header style={{ background: '#1B4BA0', color: '#FFFFFF', padding: '0 40px' }}>
        <div style={{ maxWidth: '1520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '66px', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
            <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-.02em' }}>CINEMAX</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10.5px', letterSpacing: '.18em', color: '#AFC2E6', textTransform: 'uppercase' }}>
              Gerenciamento integrado
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11.5px', color: '#AFC2E6' }}>
              Franca · SP · {hoje}
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '26px', borderLeft: '1px solid rgba(255,255,255,.3)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: '#16295B', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.04em' }}>
                  {iniciais}
                </div>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{user.nome}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: '#AFC2E6', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    {user.perfil}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sair do sistema"
                  style={{
                    marginLeft: '12px',
                    border: '1px solid rgba(255,255,255,.4)',
                    background: 'transparent',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '3px',
                    padding: '4px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;