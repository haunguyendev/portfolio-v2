'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiDocker,
  SiPrisma,
  SiDotnet,
  SiNestjs,
  SiRedis,
  SiGit,
  SiGithub,
  SiGitlab,
  SiVercel,
  SiKubernetes,
  SiLinux,
  SiFigma,
  SiDavinciresolve,
  SiCanva,
  SiClaude,
  SiOpenai,
  SiGooglegemini,
} from 'react-icons/si'
import { BrainCircuit, Scissors, Film } from 'lucide-react'
import type { IconType } from 'react-icons'
import type { LucideIcon } from 'lucide-react'

type TechItem = {
  name: string
  icon: IconType | LucideIcon
  color: string
}

type TechCategory = {
  label: string
  items: TechItem[]
}

const CATEGORIES: TechCategory[] = [
  {
    label: 'Frontend',
    items: [
      { name: 'React', icon: SiReact, color: 'text-[#61DAFB]' },
      { name: 'Next.js', icon: SiNextdotjs, color: 'text-foreground' },
      { name: 'TypeScript', icon: SiTypescript, color: 'text-[#3178C6]' },
      { name: 'Tailwind', icon: SiTailwindcss, color: 'text-[#06B6D4]' },
    ],
  },
  {
    label: 'Backend',
    items: [
      { name: 'Node.js', icon: SiNodedotjs, color: 'text-[#5FA04E]' },
      { name: 'NestJS', icon: SiNestjs, color: 'text-[#E0234E]' },
      { name: '.NET', icon: SiDotnet, color: 'text-[#512BD4]' },
      { name: 'Express', icon: SiExpress, color: 'text-foreground' },
      { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-[#4169E1]' },
      { name: 'Prisma', icon: SiPrisma, color: 'text-foreground' },
      { name: 'Redis', icon: SiRedis, color: 'text-[#DC382D]' },
      { name: 'Docker', icon: SiDocker, color: 'text-[#2496ED]' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Git', icon: SiGit, color: 'text-[#F05032]' },
      { name: 'GitHub', icon: SiGithub, color: 'text-foreground' },
      { name: 'GitLab', icon: SiGitlab, color: 'text-[#FC6D26]' },
      { name: 'Vercel', icon: SiVercel, color: 'text-foreground' },
      { name: 'Kubernetes', icon: SiKubernetes, color: 'text-[#326CE5]' },
      { name: 'Linux', icon: SiLinux, color: 'text-foreground' },
      { name: 'Figma', icon: SiFigma, color: 'text-[#F24E1E]' },
    ],
  },
  {
    label: 'Editing',
    items: [
      { name: 'CapCut', icon: Scissors, color: 'text-foreground' },
      { name: 'Premiere', icon: Film, color: 'text-[#9999FF]' },
      { name: 'DaVinci', icon: SiDavinciresolve, color: 'text-[#E12B30]' },
      { name: 'Canva', icon: SiCanva, color: 'text-[#00C4CC]' },
    ],
  },
  {
    label: 'AI',
    items: [
      { name: 'Claude', icon: SiClaude, color: 'text-[#D97757]' },
      { name: 'GPT', icon: SiOpenai, color: 'text-foreground' },
      { name: 'Codex', icon: SiOpenai, color: 'text-[#10A37F]' },
      { name: 'Gemini', icon: SiGooglegemini, color: 'text-[#8E75B2]' },
      { name: 'GLM', icon: BrainCircuit, color: 'text-[#3B82F6]' },
    ],
  },
]

export function TechStackTabs() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(i)}
            className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === i
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === i && (
              <motion.span
                layoutId="tech-tab-bg"
                className="absolute inset-0 rounded-md bg-muted"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 gap-3 sm:grid-cols-5"
        >
          {CATEGORIES[activeTab].items.map((tech) => (
            <div
              key={tech.name}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <tech.icon className={`size-7 ${tech.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {tech.name}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
