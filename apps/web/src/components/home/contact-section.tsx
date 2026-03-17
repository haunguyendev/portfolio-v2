import { Mail, Phone, Linkedin } from 'lucide-react'
import { SiFacebook, SiZalo } from 'react-icons/si'
import { AnimatedCtaCard } from '@/components/home/animated-cta-card'

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'haunt150603@gmail.com',
    href: 'mailto:haunt150603@gmail.com',
  },
  {
    icon: Phone,
    label: 'Zalo',
    value: '0969 313 263',
    href: 'https://zalo.me/0969313263',
  },
]

const SOCIALS = [
  {
    icon: SiFacebook,
    label: 'Facebook',
    href: 'https://www.facebook.com/nguyen.trung.hau.778410/',
    color: 'hover:text-[#1877F2]',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/h%E1%BA%ADu-nguy%E1%BB%85n-6b1576229/',
    color: 'hover:text-[#0A66C2]',
  },
  {
    icon: SiZalo,
    label: 'Zalo',
    href: 'https://zalo.me/0969313263',
    color: 'hover:text-[#0068FF]',
  },
]

export function ContactSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
          Let&apos;s Work Together
        </h2>

        {/* Grid 1:1 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Animated CTA */}
          <AnimatedCtaCard />

          {/* Right: Contact info */}
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground">
              I&apos;m looking for full-stack or frontend roles at product
              companies. Also open to freelance projects — feel free to reach
              out!
            </p>

            {/* Contact method cards */}
            <div className="flex flex-col gap-3">
              {CONTACT_METHODS.map((method) => (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 rounded-xl border border-border bg-background px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <method.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {method.label}
                    </span>
                    <span className="text-base font-medium text-foreground">
                      {method.value}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${social.color}`}
                >
                  <social.icon className="size-5" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
