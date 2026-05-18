import { Image, Text, View } from 'react-native'

interface BrandLogoProps {
  logoUrl: string | null | undefined
  name: string | null | undefined
  size?: number
}

export function BrandLogo({ logoUrl, name, size = 40 }: BrandLogoProps) {
  if (logoUrl) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    )
  }
  const initials = (name ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-gray-200 items-center justify-center"
    >
      <Text className="text-navy font-bold" style={{ fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  )
}
