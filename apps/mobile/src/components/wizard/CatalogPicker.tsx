import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'

export interface CatalogPickerItem {
  id: string
  label: string
  sublabel?: string | null
}

interface CatalogPickerProps {
  title: string
  items: CatalogPickerItem[]
  selectedId?: string | null
  onSelect: (item: CatalogPickerItem) => void
  triggerLabel: string
  disabled?: boolean
  emptyLabel?: string
}

export function CatalogPicker({
  title,
  items,
  selectedId,
  onSelect,
  triggerLabel,
  disabled = false,
  emptyLabel = 'No hay opciones disponibles',
}: CatalogPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = items.find(i => i.id === selectedId)

  return (
    <>
      <Pressable
        className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between disabled:opacity-50"
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <View className="flex-1 pr-2">
          <Text className="text-sm text-navy" numberOfLines={1}>
            {selected ? selected.label : triggerLabel}
          </Text>
          {selected?.sublabel && (
            <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
              {selected.sublabel}
            </Text>
          )}
        </View>
        <Text className="text-gray-400">›</Text>
      </Pressable>

      {/* RN's Modal portals its children to a separate native view controller
        on iOS, even when visible={false} — those children lose the navigation
        context, so any re-render that originates from a parent state update
        (e.g. zustand notifying a sibling SegmentedControl) crashes with
        MISSING_CONTEXT_ERROR. Mount the Modal only while open. */}
      {open && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setOpen(false)}
        >
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-base font-bold text-navy">{title}</Text>
              <Pressable onPress={() => setOpen(false)} className="p-2">
                <Text className="text-primary-light font-semibold">Cerrar</Text>
              </Pressable>
            </View>
            {items.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <Text className="text-gray-500 text-center">{emptyLabel}</Text>
              </View>
            ) : (
              <ScrollView className="flex-1">
                {items.map(item => {
                  const isSelected = item.id === selectedId
                  return (
                    <Pressable
                      key={item.id}
                      className={`px-4 py-4 border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                      onPress={() => {
                        onSelect(item)
                        setOpen(false)
                      }}
                    >
                      <Text className="text-sm text-navy font-medium">{item.label}</Text>
                      {item.sublabel && (
                        <Text className="text-xs text-gray-500 mt-0.5">{item.sublabel}</Text>
                      )}
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}
          </View>
        </Modal>
      )}
    </>
  )
}
