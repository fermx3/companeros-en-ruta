'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface GeoPosition {
  latitude: number
  longitude: number
}

interface UseGeolocationReturn {
  location: GeoPosition | null
  loading: boolean
  error: string | null
  getLocation: () => Promise<GeoPosition | null>
}

interface UseGeolocationOptions {
  /** Call getLocation() automatically on mount */
  autoFetch?: boolean
}

export function useGeolocation(options?: UseGeolocationOptions): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const getLocation = useCallback(async (): Promise<GeoPosition | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const coords: GeoPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      if (mountedRef.current) {
        setLocation(coords)
        setLoading(false)
      }

      return coords
    } catch (err) {
      const geoError = err as GeolocationPositionError
      const message =
        geoError.code === 1
          ? 'Permiso de ubicación denegado'
          : 'Error al obtener ubicación'

      if (mountedRef.current) {
        setError(message)
        setLoading(false)
      }

      return null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    if (options?.autoFetch && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mountedRef.current) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          }
        },
        () => {
          // Silently ignore errors on autoFetch (matches original entregar-promocion behavior)
        },
      )
    }

    return () => {
      mountedRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { location, loading, error, getLocation }
}
