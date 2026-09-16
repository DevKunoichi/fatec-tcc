import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { key: 'sessoes', path: '/', num: '01', label: 'Sessões', count: 8 },
  { key: 'produtos', path: '/produtos', num: '02', label: 'Produtos & estoque', count: 8 },
  { key: 'usuarios', path: '/usuarios', num: '03', label: 'Usuários', count: 6 }
];

const Navigation = () => {
  return (
    <nav style={{ background: '#FFFFFF', padding: '0 40px', borderBottom: '1px solid #D5DEEA' }}>
      <div style={{ maxWidth: '1520px', margin: '0 auto', display: 'flex', gap: 0 }}>
        {navItems.map(t => (
          <NavLink
            key={t.key}
            to={t.path}
            style={({ isActive }) => ({
              border: 0,
              borderBottom: isActive ? '4px solid #1B4BA0' : '4px solid transparent',
              background: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? '#16295B' : '#5C6779',
              cursor: 'pointer',
              padding: '17px 28px 15px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '11px',
              fontSize: '13.5px',
              fontWeight: 600,
              letterSpacing: '.01em',
              marginBottom: '-1px',
              textDecoration: 'none'
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10.5px', letterSpacing: '.1em', opacity: .65 }}>
                  {t.num}
                </span>
                {t.label}
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  background: isActive ? '#1B4BA0' : '#E7ECF4',
                  color: isActive ? '#FFFFFF' : '#5C6779'
                }}>
                  {t.count}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
