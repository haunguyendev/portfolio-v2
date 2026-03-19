import { GraphQLClient } from 'graphql-request'

/** Server-side: use INTERNAL_API_URL (Docker: http://api:3001). Client-side: absolute URL via rewrite. */
const GQL_URL =
  typeof window === 'undefined'
    ? `${process.env.INTERNAL_API_URL ?? 'http://localhost:3001'}/graphql`
    : `${window.location.origin}/graphql`

function getGraphQLClient(token?: string) {
  return new GraphQLClient(GQL_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

// Server-side client (no token — for public queries)
export const gqlClient = getGraphQLClient()

/**
 * Get an authenticated GraphQL client by fetching the session token
 * from Better Auth's API endpoint (works even with HttpOnly cookies).
 */
export async function getAuthenticatedGqlClient(): Promise<GraphQLClient> {
  const res = await fetch('/api/auth/get-session', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Not authenticated')
  }

  const data = await res.json()
  const token = data?.session?.token

  if (!token) {
    throw new Error('No session token')
  }

  return getGraphQLClient(token)
}

// Factory for authenticated client (manual token)
export { getGraphQLClient }
