import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo/logo-light.svg"
        alt="haunguyen.dev"
        width={180}
        height={40}
        className="h-10 w-auto"
        priority
      />
    </Link>
  )
}
