import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const POLAROID_VARIANTS = ['memory', 'project', 'work', 'lab', 'post'] as const
const POLAROID_STATES = ['clear', 'blurred'] as const

type PolaroidVariant = (typeof POLAROID_VARIANTS)[number]
type PolaroidState = (typeof POLAROID_STATES)[number]

const polaroidFrame = cva(
  'flex w-full flex-col bg-polaroid-paper p-3 pb-5 text-polaroid-ink shadow-xl',
  {
    variants: {
      variant: {
        memory: 'border border-transparent',
        project: 'border border-polaroid-accent',
        work: 'border border-polaroid-link',
        lab: 'border border-dashed border-polaroid-muted',
        post: 'border border-polaroid-text',
      },
    },
  },
)

const captionMark: Record<PolaroidVariant, string> = {
  memory: 'bg-polaroid-muted',
  project: 'bg-polaroid-accent',
  work: 'bg-polaroid-link',
  lab: 'bg-polaroid-border',
  post: 'bg-polaroid-text',
}

type PolaroidProps = VariantProps<typeof polaroidFrame> & {
  variant: PolaroidVariant
  state?: PolaroidState
  caption: string
  children?: ReactNode
  className?: string
}

function Polaroid({
  variant,
  state = 'clear',
  caption,
  children,
  className,
}: PolaroidProps) {
  return (
    <figure
      data-variant={variant}
      data-state={state}
      className={cn(polaroidFrame({ variant }), className)}
    >
      <div
        data-state={state}
        className="aspect-square w-full overflow-hidden bg-polaroid-surface transition-[filter,opacity] duration-200 motion-reduce:transition-none data-[state=blurred]:opacity-60 data-[state=blurred]:blur-md"
      >
        {children}
      </div>
      <figcaption className="px-1 pt-4 text-center text-sm leading-5">
        <span
          aria-hidden="true"
          className={cn('mx-auto mb-2 block h-0.5 w-8', captionMark[variant])}
        />
        {caption}
      </figcaption>
    </figure>
  )
}

export { Polaroid, POLAROID_STATES, POLAROID_VARIANTS }
export type { PolaroidState, PolaroidVariant }
