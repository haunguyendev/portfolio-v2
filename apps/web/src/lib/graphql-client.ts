import { GraphQLClient } from 'graphql-request'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getGraphQLClient(token?: string) {
  return new GraphQLClient(`${API_URL}/graphql`, {
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
