import { Github, GitFork, UsersRound } from 'lucide-react'
import { getGitHubStats, getGitHubContributionGraphUrl } from '@/lib/github'
import { LifeSourceCode } from '@/components/about/life-source-code'

export async function GitHubStatsSection() {
  const stats = await getGitHubStats()

  return (
    <section className="mb-12 md:mb-16">
      {/* 1:1 grid — terminal left, GitHub right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Life source code terminal */}
        <div className="flex flex-col">
          <h2 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
            Source Code
          </h2>
          <div className="flex-1">
            <LifeSourceCode />
          </div>
        </div>

        {/* Right: GitHub activity */}
        <div className="flex flex-col">
          <h2 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
            GitHub Activity
          </h2>

          {/* Stats row */}
          {stats && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-3">
                <GitFork className="size-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {stats.publicRepos}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Repos
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-3">
                <UsersRound className="size-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {stats.followers}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Followers
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-3">
                <Github className="size-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {new Date(stats.createdAt).getFullYear()}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Since
                </span>
              </div>
            </div>
          )}

          {/* Contribution graph */}
          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-background p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contribution Graph
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getGitHubContributionGraphUrl()}
              alt="GitHub contribution graph for haunguyendev"
              className="w-full"
              loading="lazy"
            />
          </div>

          {/* Link to profile */}
          <div className="mt-3">
            <a
              href="https://github.com/haunguyendev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              View full profile on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
