/**
 * Helper for adding Cache-Control headers to brand API responses.
 *
 * - private: only browser cache (user-specific RLS data)
 * - max-age=300: fresh for 5 minutes
 * - stale-while-revalidate=600: serve stale up to 10 min while revalidating
 */
export function cachedJsonResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=600' },
  })
}
