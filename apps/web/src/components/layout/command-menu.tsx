'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Command } from 'cmdk'
import {
  Home,
  FolderOpen,
  User,
  PenLine,
  BookHeart,
  Sun,
  Moon,
  Monitor,
  Github,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Search,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

const NAV_ICONS: Record<string, React.ElementType> = {
  '/': Home,
  '/projects': FolderOpen,
  '/about': User,
  '/blog': PenLine,
  '/diary': BookHeart,
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  // Toggle with ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [],
  )

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[480px]">
          <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Navigation */}
              <Command.Group heading="Navigation">
                {NAV_LINKS.map((link) => {
                  const Icon = NAV_ICONS[link.href] || LinkIcon
                  return (
                    <Command.Item
                      key={link.href}
                      value={link.label}
                      onSelect={() => runCommand(() => router.push(link.href))}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Command.Item>
                  )
                })}
              </Command.Group>

              {/* Theme */}
              <Command.Group heading="Theme">
                <Command.Item
                  value="Light theme"
                  onSelect={() => runCommand(() => setTheme('light'))}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  Light
                </Command.Item>
                <Command.Item
                  value="Dark theme"
                  onSelect={() => runCommand(() => setTheme('dark'))}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  Dark
                </Command.Item>
                <Command.Item
                  value="System theme"
                  onSelect={() => runCommand(() => setTheme('system'))}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  System
                </Command.Item>
              </Command.Group>

              {/* Social */}
              <Command.Group heading="Links">
                <Command.Item
                  value="GitHub"
                  onSelect={() =>
                    runCommand(() => window.open(SOCIAL_LINKS.github, '_blank'))
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Github className="h-4 w-4 text-muted-foreground" />
                  GitHub
                </Command.Item>
                <Command.Item
                  value="LinkedIn"
                  onSelect={() =>
                    runCommand(() =>
                      window.open(SOCIAL_LINKS.linkedin, '_blank'),
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  LinkedIn
                </Command.Item>
                <Command.Item
                  value="Email"
                  onSelect={() =>
                    runCommand(() => window.open(SOCIAL_LINKS.email))
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
