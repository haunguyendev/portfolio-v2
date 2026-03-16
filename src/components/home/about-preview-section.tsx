'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Briefcase, FolderGit2, Layers } from 'lucide-react'

const TechStackTabs = dynamic(
  () => import('@/components/home/tech-stack-tabs').then(m => ({ default: m.TechStackTabs })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)

const STATS = [
  { icon: Briefcase, value: '1yr', label: 'Shipping Production Code' },
  { icon: FolderGit2, value: '9', label: 'Production Apps' },
  { icon: Layers, value: '10+', label: 'Tools in My Stack' },
]


export function AboutPreviewSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        {/* Bento grid: 4 columns on md+ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-[auto_auto_auto_auto]">
          {/* Bio card — spans 3 cols, 3 rows (matching 3 stat cards) */}
          <div className="rounded-xl border border-border bg-background p-6 md:col-span-3 md:row-span-3 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              About Me
            </h2>
            <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
              <p>
                Built 5 production apps across full-stack — from real-time task
                management (500+ users) to e-commerce APIs handling 1K+
                orders/month. I pick up new stacks fast and ship clean, tested
                code.
              </p>
              <p>
                Looking for a full-stack or frontend role where I can grow with
                a strong engineering team. Currently based in Ho Chi Minh City.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                Learn More About Me
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Stat cards — 1 col each, stacked on right */}
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <stat.icon className="size-5 text-muted-foreground" />
              <div>
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="ml-1.5 text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}

          {/* Tech stack card with tabs — spans full width */}
          <div className="rounded-xl border border-border bg-background p-6 md:col-span-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tech Stack
            </h3>
            <TechStackTabs />
          </div>
        </div>
      </div>
    </section>
  )
}
