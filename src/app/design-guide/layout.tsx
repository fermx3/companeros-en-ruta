import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design Guide — Compañeros en Ruta',
}

export default function DesignGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
