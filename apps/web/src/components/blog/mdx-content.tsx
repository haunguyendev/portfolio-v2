'use client'

import { useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

// Memoize MDX component creation to avoid re-creating on every render
export function MdxContent({ code }: { code: string }) {
  const Component = useMemo(() => {
    const fn = new Function(code)
    return fn({ ...runtime }).default
  }, [code])

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:underline-offset-4 prose-pre:p-0">
      <Component components={mdxComponents} />
    </div>
  )
}
