// Fetch public GitHub profile stats at build time
const GITHUB_USERNAME = 'haunguyendev'
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`

export interface GitHubStats {
  publicRepos: number
  followers: number
  following: number
  createdAt: string
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  try {
    const res = await fetch(GITHUB_API, {
      next: { revalidate: 86400 }, // revalidate once per day
    })
    if (!res.ok) return null

    const data = await res.json()
    return {
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
    }
  } catch {
    return null
  }
}

export function getGitHubContributionGraphUrl(): string {
  return `https://ghchart.rshah.org/haunguyendev`
}
