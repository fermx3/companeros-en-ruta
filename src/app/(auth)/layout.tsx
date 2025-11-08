import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#f5f5f5' }}>
        <h1>Compañeros en Ruta</h1>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{ padding: '1rem', background: '#f5f5f5', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} Compañeros en Ruta
      </footer>
    </div>
  );
}
