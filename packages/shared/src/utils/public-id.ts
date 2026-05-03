const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Determines whether a URL parameter is a UUID or a public_id,
 * and returns the correct column name to query against.
 *
 * This allows API routes to accept either format in URLs,
 * supporting both human-readable public_id (e.g. CLI-0042)
 * and legacy UUID bookmarks.
 */
export function resolveIdColumn(param: string): 'id' | 'public_id' {
  return UUID_REGEX.test(param) ? 'id' : 'public_id'
}
