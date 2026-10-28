import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const POLAROID_VARIANTS = ['memory', 'project', 'work', 'lab', 'post'] as const
const POLAROID_STATES = ['clear', 'blurred'] as const

type PolaroidVariant = (typeof POLAROID_VARIANTS)[number]
type PolaroidState = (typeof POLAROID_STATES)[number]

const polaroidFrame = cva('flex w-full flex-col p-3 pb-5 shadow-xl', {
  variants: {
    variant: {
      memory: 'border-0 bg-polaroid-frame-memory text-polaroid-ink-memory',
      project:
        'bg-polaroid-paper text-polaroid-ink ring-2 ring-polaroid-accent ring-offset-2 ring-offset-polaroid-bg',
      work: 'bg-polaroid-paper text-polaroid-ink ring-2 ring-polaroid-link ring-offset-2 ring-offset-polaroid-bg',
      lab: 'bg-polaroid-paper text-polaroid-ink outline-2 outline-dashed outline-offset-2 outline-polaroid-muted',
      post: 'bg-polaroid-paper text-polaroid-ink ring-2 ring-polaroid-text ring-offset-2 ring-offset-polaroid-bg',
    },
  },
})

const captionMark: Record<PolaroidVariant, string> = {
  memory: 'bg-polaroid-ink-memory',
  project: 'bg-polaroid-accent',
  work: 'bg-polaroid-link',
  lab: 'bg-polaroid-border',
  post: 'bg-polaroid-ink',
}

const blurredPhoto =
  'blur-[3px] saturate-50 brightness-75 opacity-70 group-hover:blur-0 group-hover:saturate-100 group-hover:brightness-100 group-hover:opacity-100 group-focus-within:blur-0 group-focus-within:saturate-100 group-focus-within:brightness-100 group-focus-within:opacity-100'

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
    <div
      tabIndex={0}
      className="group focus-visible:outline-polaroid-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
    >
      <figure
        data-variant={variant}
        data-state={state}
        className={cn(polaroidFrame({ variant }), className)}
      >
        <div
          data-state={state}
          className={cn(
            'bg-polaroid-surface aspect-square w-full overflow-hidden transition-[filter,opacity] duration-300 motion-reduce:transition-none',
            state === 'blurred' && blurredPhoto,
          )}
        >
          {children}
        </div>
        <figcaption className="px-1 pt-4 text-center text-sm leading-5">
          <span
            aria-hidden="true"
            className={cn('mx-auto mb-2 block h-1 w-10', captionMark[variant])}
          />
          {caption}
        </figcaption>
      </figure>
    </div>
  )
}

export { Polaroid, POLAROID_STATES, POLAROID_VARIANTS }
export type { PolaroidState, PolaroidVariant }
