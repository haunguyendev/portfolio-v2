import type { Metadata } from 'next'

import {
  Polaroid,
  POLAROID_STATES,
  POLAROID_VARIANTS,
  type PolaroidVariant,
} from '@/components/polaroid/polaroid'

export const metadata: Metadata = {
  title: 'Polaroid design',
  robots: { index: false, follow: false },
}

const captions: Record<PolaroidVariant, string> = {
  memory: 'Kỷ niệm đã phai',
  project: 'Dự án',
  work: 'Công việc',
  lab: 'Thí nghiệm',
  post: 'Bài viết',
}

const stateLabel = {
  clear: 'rõ',
  blurred: 'mờ',
} as const

export default function PolaroidDesignPage() {
  return (
    <div className="container-main section-spacing">
      <h1 className="text-3xl font-semibold tracking-tight text-polaroid-text">
        Khung Polaroid
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-polaroid-muted">
        Nguyễn Trung Hậu giữ những khung ảnh ở Hà Nội. Phố cổ, mưa phùn, và một
        kỷ niệm đã phai vẫn đọc được trên nền tối.
      </p>
      <p className="mt-2 text-sm text-polaroid-link">
        Năm biến thể, mỗi biến thể có trạng thái rõ và mờ.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-5">
        {POLAROID_VARIANTS.map((variant) => (
          <div key={variant} className="flex w-full flex-col gap-6">
            {POLAROID_STATES.map((state) => (
              <Polaroid
                key={state}
                variant={variant}
                state={state}
                caption={`${captions[variant]} · ${stateLabel[state]}`}
              >
                <div className="h-full w-full bg-[linear-gradient(160deg,var(--polaroid-accent),var(--polaroid-link))]" />
              </Polaroid>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
