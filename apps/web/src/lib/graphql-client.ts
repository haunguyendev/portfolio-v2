import { GraphQLClient } from 'graphql-request'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getGraphQLClient(token?: string) {
  return new GraphQLClient(`${API_URL}/graphql`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

// Server-side client using env (no token — for public queries)
export const gqlClient = getGraphQLClient()

// Factory for authenticated client (admin mutations)
export { getGraphQLClient }
