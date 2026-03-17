/**
 * Production seed — chỉ tạo data tối thiểu cần thiết cho app hoạt động.
 * Khác với seed.ts (dev) đọc MDX files, script này chỉ dùng Prisma.
 * Chạy tự động qua entrypoint khi deploy lần đầu.
 * Dùng upsert → chạy nhiều lần không bị duplicate.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default categories cho blog
const DEFAULT_CATEGORIES = [
  { name: 'Technology', slug: 'technology', sortOrder: 0 },
  { name: 'Life', slug: 'life', sortOrder: 1 },
  { name: 'Career', slug: 'career', sortOrder: 2 },
]

// Default tags
const DEFAULT_TAGS = [
  'nextjs',
  'react',
  'typescript',
  'tailwindcss',
  'nodejs',
  'docker',
  'devops',
  'prisma',
  'postgresql',
  'personal',
]

async function seedAdminUser() {
  console.log('Seeding admin user...')
  const email = process.env.ADMIN_EMAIL || 'admin@kanenguyen.dev'
  const name = process.env.ADMIN_NAME || 'Kane Nguyen'

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      emailVerified: true,
      role: 'ADMIN',
    },
  })
  console.log(`  Admin: ${user.email}`)
  return user
}

async function seedCategories() {
  console.log('Seeding categories...')
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`  ${DEFAULT_CATEGORIES.length} categories`)
}

async function seedTags() {
  console.log('Seeding tags...')
  for (const name of DEFAULT_TAGS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`  ${DEFAULT_TAGS.length} tags`)
}

async function main() {
  console.log('Production seed starting...\n')

  await seedAdminUser()
  await seedCategories()
  await seedTags()

  console.log('\nProduction seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
