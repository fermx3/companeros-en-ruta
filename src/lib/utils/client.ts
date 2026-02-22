/**
 * Concatenates owner_name and owner_last_name into a full display name.
 */
export function fullOwnerName(
  ownerName: string | null | undefined,
  ownerLastName: string | null | undefined
): string {
  return [ownerName, ownerLastName].filter(Boolean).join(' ') || ''
}
