'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Search, ChevronDown } from 'lucide-react'

interface CatalogItem {
  id: string
  name: string
  code?: string
  [key: string]: unknown
}

interface CatalogMultiSelectProps {
  label: string
  items: CatalogItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  displayField?: string
}

export function CatalogMultiSelect({
  label,
  items,
  selectedIds,
  onChange,
  placeholder = 'Seleccionar...',
  displayField = 'name',
}: CatalogMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = items.filter(item => {
    const name = String(item[displayField] || item.name || '')
    const code = item.code || ''
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q)
  })

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(s => s !== id)
        : [...selectedIds, id]
    )
  }

  const selectedItems = items.filter(i => selectedIds.includes(i.id))

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>

      {/* Selected chips */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selectedItems.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {String(item[displayField] || item.name)}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-left hover:border-gray-400 transition-colors bg-white"
      >
        <span className="text-gray-500">
          {selectedIds.length > 0
            ? `${selectedIds.length} seleccionado${selectedIds.length > 1 ? 's' : ''}`
            : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-44">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
            ) : (
              filtered.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggle(item.id)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>{String(item[displayField] || item.name)}</span>
                  {item.code && (
                    <span className="text-xs text-gray-400 ml-auto">{item.code}</span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
