// Bio section with hardcoded personal introduction paragraphs
export function BioSection() {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        About Me
      </h2>

      <div className="max-w-3xl space-y-4">
        <p className="text-base text-muted-foreground leading-relaxed">
          Hi, I&apos;m Kane Nguyen — a Software Engineer with around 1 year of
          professional experience building web applications. I enjoy turning
          ideas into clean, functional products that are both fast and
          easy to use.
        </p>

        <p className="text-base text-muted-foreground leading-relaxed">
          I studied Computer Science and got my start in full-stack development,
          working primarily with React, Next.js, TypeScript, and Node.js. I care
          about writing maintainable code, shipping thoughtfully, and learning
          from every project I take on.
        </p>

        <p className="text-base text-muted-foreground leading-relaxed">
          Outside of work, I enjoy exploring good design, reading about software
          craftsmanship, and occasionally tinkering with side projects like this
          portfolio. I&apos;m always up for conversations about tech, products,
          or anything creative.
        </p>
      </div>
    </section>
  )
}
