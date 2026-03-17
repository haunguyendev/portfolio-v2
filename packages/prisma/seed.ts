import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { mdxToTipTap } from "./mdx-to-tiptap-converter";

const prisma = new PrismaClient();

const WEB_ROOT = path.resolve(__dirname, "../../apps/web");
const PROJECTS_JSON = path.join(WEB_ROOT, "src/content/projects.json");
const BLOG_DIR = path.join(WEB_ROOT, "content/blog");
const DIARY_DIR = path.join(WEB_ROOT, "content/diary");

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Projects ───────────────────────────────────────────────────────────────

async function seedProjects() {
  console.log("Seeding projects...");
  const raw = fs.readFileSync(PROJECTS_JSON, "utf-8");
  const projects: any[] = JSON.parse(raw);

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    await prisma.project.upsert({
      where: { slug: slugify(p.id) },
      update: {},
      create: {
        title: p.title,
        slug: slugify(p.id),
        description: p.description,
        longDesc: p.longDescription ?? null,
        image: p.image ?? null,
        technologies: p.technologies ?? [],
        category: p.category ?? null,
        github: p.links?.github ?? null,
        demo: p.links?.demo ?? null,
        featured: p.featured ?? false,
        sortOrder: i,
        role: p.role ?? null,
        teamSize: p.teamSize ?? null,
        impact: p.impact ?? null,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null,
      },
    });
  }
  console.log(`  Seeded ${projects.length} projects`);
}

// ─── Categories & Tags ──────────────────────────────────────────────────────

async function ensureCategory(name: string) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, sortOrder: 0 },
  });
}

async function ensureTag(name: string) {
  const slug = slugify(name);
  return prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

// ─── Posts (Blog + Diary) ───────────────────────────────────────────────────

async function seedPostsFromDir(
  dir: string,
  type: "BLOG" | "DIARY",
  authorId: string
) {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const slug = frontmatter.slug ?? slugify(path.basename(file, ".mdx"));
    const tiptapContent = mdxToTipTap(content);
    const readingTime = estimateReadingTime(content);

    // Resolve category
    let categoryId: string | null = null;
    if (frontmatter.category) {
      const cat = await ensureCategory(frontmatter.category);
      categoryId = cat.id;
    }

    // Resolve tags
    const tagIds: string[] = [];
    if (Array.isArray(frontmatter.tags)) {
      for (const tagName of frontmatter.tags) {
        const tag = await ensureTag(tagName);
        tagIds.push(tag.id);
      }
    }

    const publishedAt =
      frontmatter.published && frontmatter.date
        ? new Date(frontmatter.date)
        : null;

    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title: frontmatter.title ?? file,
        slug,
        description: frontmatter.description ?? null,
        content: tiptapContent as any,
        published: frontmatter.published ?? false,
        featured: frontmatter.featured ?? false,
        type,
        readingTime,
        mood: frontmatter.mood ?? null,
        categoryId,
        authorId,
        publishedAt,
        tags: tagIds.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
    });
  }

  return files.length;
}

// ─── Admin User ─────────────────────────────────────────────────────────────

async function seedAdminUser() {
  console.log("Seeding admin user...");
  const user = await prisma.user.upsert({
    where: { email: "admin@kanenguyen.dev" },
    update: {},
    create: {
      email: "admin@kanenguyen.dev",
      name: "Kane Nguyen",
      emailVerified: true,
      role: "ADMIN",
    },
  });
  console.log(`  Admin user: ${user.email} (${user.id})`);
  return user;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting seed...\n");

  const admin = await seedAdminUser();
  await seedProjects();

  console.log("Seeding blog posts...");
  const blogCount = await seedPostsFromDir(BLOG_DIR, "BLOG", admin.id);
  console.log(`  Seeded ${blogCount} blog posts`);

  console.log("Seeding diary entries...");
  const diaryCount = await seedPostsFromDir(DIARY_DIR, "DIARY", admin.id);
  console.log(`  Seeded ${diaryCount} diary entries`);

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
