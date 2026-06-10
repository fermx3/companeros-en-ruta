import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'

import { useClientProfile } from '@/features/profile/api'

interface ProfileAvatarButtonProps {
  size?: number
}

export function ProfileAvatarButton({ size = 32 }: ProfileAvatarButtonProps) {
  const profileQuery = useClientProfile()
  const profile = profileQuery.data

  const initialsSource =
    profile?.owner_name?.trim() || profile?.business_name?.trim() || '?'
  const initials = initialsSource
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Pressable
      onPress={() => router.push('/profile' as never)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Ir a perfil"
      style={{ marginRight: 12 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#dd5025',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontFamily: 'NunitoSans_700Bold',
            fontSize: size * 0.4,
          }}
        >
          {initials}
        </Text>
      </View>
    </Pressable>
  )
}
