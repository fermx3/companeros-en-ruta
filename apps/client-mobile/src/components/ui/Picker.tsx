import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ChevronRight, Search, X } from './Icon'

export interface PickerOption {
  value: string
  label: string
}

interface PickerProps {
  options: PickerOption[]
  value: string | undefined
  onChange: (next: string) => void
  placeholder?: string
  title?: string
  invalid?: boolean
  searchable?: boolean
}

/**
 * Pressable that opens a Modal sheet with a searchable list of options. Use
 * for dropdowns where a SegmentedControl/FilterChip set would overflow
 * (e.g. estados, países, listas largas).
 */
export function Picker({
  options,
  value,
  onChange,
  placeholder = 'Selecciona...',
  title = 'Selecciona una opción',
  invalid = false,
  searchable = true,
}: PickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedLabel = useMemo(
    () => options.find(o => o.value === value)?.label ?? null,
    [options, value]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  function pick(opt: PickerOption) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <Pressable
        className="bg-card px-3 rounded-lg flex-row items-center"
        style={{
          height: 44,
          borderWidth: 1,
          borderColor: invalid ? '#dc2626' : '#cccccc',
        }}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text
          className={`flex-1 text-sm ${selectedLabel ? 'text-navy' : 'text-muted-foreground'}`}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronRight size={18} color="#999999" />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
          <View
            className="flex-row items-center justify-between px-4 py-3 bg-card"
            style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
          >
            <Text className="text-base font-bold text-navy flex-1" numberOfLines={1}>
              {title}
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={8}
              accessibilityLabel="Cerrar"
            >
              <X size={22} color="#202456" />
            </Pressable>
          </View>

          {searchable && (
            <View
              className="px-4 py-3 bg-card flex-row items-center"
              style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
            >
              <Search size={18} color="#999999" />
              <TextInput
                className="flex-1 ml-2 text-sm text-navy"
                placeholder="Buscar..."
                placeholderTextColor="#999999"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
                style={{ paddingVertical: 8 }}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={16} color="#999999" />
                </Pressable>
              )}
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={o => o.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-sm text-muted-foreground">Sin resultados</Text>
              </View>
            }
            renderItem={({ item }) => {
              const selected = item.value === value
              return (
                <Pressable
                  onPress={() => pick(item)}
                  className="flex-row items-center px-4 py-3 bg-card"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(204,204,204,0.3)',
                  }}
                >
                  <Text
                    className={`flex-1 text-sm ${selected ? 'font-bold text-primary' : 'text-navy'}`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}
