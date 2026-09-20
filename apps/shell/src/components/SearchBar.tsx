import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '@portal/api-client';
import { usePortal } from '../portal';

/** Busca global do portal — consulta o BFF e navega para a jornada. */
export function SearchBar() {
  const { client, featureFlags } = usePortal();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!featureFlags['busca-global'] || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      client.search(q).then(setResults).catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q, client, featureFlags]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (featureFlags['busca-global'] === false) return null;

  return (
    <div ref={boxRef} style={{ position: 'relative', minWidth: 280 }}>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        placeholder="Buscar jornadas e serviços..."
        aria-label="Busca global"
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 'var(--portal-radius-md)',
          border: '1px solid var(--portal-color-border)',
          fontSize: 'var(--portal-font-md)',
        }}
      />
      {open && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            background: 'var(--portal-color-surface)',
            border: '1px solid var(--portal-color-border)',
            borderRadius: 'var(--portal-radius-md)',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            zIndex: 50,
          }}
        >
          {results.map((r) => (
            <li key={r.id}>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 'var(--portal-font-md)',
                }}
                onClick={() => {
                  setOpen(false);
                  setQ('');
                  navigate(r.route);
                }}
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
