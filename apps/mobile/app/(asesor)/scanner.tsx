import { useRef, useState } from 'react'
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useRedeemQR } from '@/features/asesor/qr/api'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanning, setScanning] = useState(true)
  const lastScan = useRef<string | null>(null)
  const redeem = useRedeemQR()

  async function getCoords() {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync()
      if (perm !== 'granted') return null
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    } catch {
      return null
    }
  }

  async function onBarcodeScanned({ data }: { data: string }) {
    if (!scanning || data === lastScan.current) return
    lastScan.current = data
    setScanning(false)
    const coords = await getCoords()
    try {
      const result = await redeem.mutateAsync({
        qr_code: data,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      })
      Alert.alert('Cupón canjeado', result.message ?? '¡Listo!', [
        {
          text: 'Escanear otro',
          onPress: () => {
            lastScan.current = null
            setScanning(true)
          },
        },
      ])
    } catch (e) {
      Alert.alert('No se pudo canjear', e instanceof Error ? e.message : 'Inténtalo de nuevo', [
        {
          text: 'Reintentar',
          onPress: () => {
            lastScan.current = null
            setScanning(true)
          },
        },
      ])
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <Text className="text-sm text-muted-foreground">Cargando permisos…</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6">
        <Card className="w-full items-center">
          <Text className="text-base font-bold text-navy text-center mb-2">
            Necesitamos acceso a tu cámara
          </Text>
          <Text className="text-sm text-muted-foreground text-center mb-4">
            Para escanear los códigos QR de los cupones de los clientes, otorga
            permiso de cámara.
          </Text>
          <Button onPress={requestPermission} variant="default" size="default">
            Otorgar permiso
          </Button>
          <View className="mt-2">
            <Button onPress={() => Linking.openSettings()} variant="ghost" size="sm">
              Abrir configuración
            </Button>
          </View>
        </Card>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
      />

      {/* Reticle overlay */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.reticle} />
      </View>

      <View style={styles.bottomBar}>
        {redeem.isPending ? (
          <Text style={styles.helpText}>Canjeando…</Text>
        ) : (
          <Text style={styles.helpText}>
            {scanning
              ? 'Apunta al código QR del cupón del cliente'
              : 'Espera… o toca "Escanear otro" en el alert'}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#dd5025',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(32,36,86,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  helpText: {
    color: '#ffffff',
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 13,
    textAlign: 'center',
  },
})
