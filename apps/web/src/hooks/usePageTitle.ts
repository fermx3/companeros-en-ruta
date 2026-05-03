import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | Compañeros en Ruta`
      : 'Compañeros en Ruta'
  }, [title])
}
