import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { ContentChunk } from "../dto/chat-types";

@Injectable()
export class ContentChunkerService {
  private readonly logger = new Logger(ContentChunkerService.name);
  private readonly contentDir: string;

  constructor(private prisma: PrismaService) {
    this.contentDir = this.resolveContentDir();
    this.logger.log(`Content directory: ${this.contentDir}`);
  }

  async chunkAll(): Promise<ContentChunk[]> {
    const chunks: ContentChunk[] = [];

    chunks.push(...this.chunkProfile());
    chunks.push(...this.chunkSkills());
    chunks.push(...this.chunkExperience());
    chunks.push(...this.chunkCertificates());
    chunks.push(...(await this.chunkProjects()));
    chunks.push(...(await this.chunkBlogPosts()));

    this.logger.log(`Total chunks: ${chunks.length}`);
    return chunks;
  }

  private chunkProfile(): ContentChunk[] {
    const data = this.readJsonFile("profile.json");
    if (!data) return [];

    const text = [
      `${data.name} — ${data.title}.`,
      data.bio?.full ?? "",
      `Location: ${data.location}.`,
      data.stats
        ? `Stats: ${data.stats.map((s: { value: string; label: string }) => `${s.value} ${s.label}`).join(", ")}.`
        : "",
      data.bio?.contact ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        content: text,
        sourceType: "profile",
        sourceId: "profile",
        metadata: { title: "About Kane Nguyen", url: "/about" },
      },
    ];
  }

  private chunkSkills(): ContentChunk[] {
    const data = this.readJsonFile("skills.json");
    if (!data || !Array.isArray(data)) return [];

    const text = data
      .map(
        (cat: { category: string; items: string[] }) =>
          `${cat.category}: ${cat.items.join(", ")}`,
      )
      .join(". ");

    return [
      {
        content: `Kane's technical skills — ${text}.`,
        sourceType: "skill",
        sourceId: "skills",
        metadata: { title: "Kane's Skills & Technologies", url: "/about" },
      },
    ];
  }

  private chunkExperience(): ContentChunk[] {
    const data = this.readJsonFile("experience.json");
    if (!data || !Array.isArray(data)) return [];

    return data.map(
      (exp: {
        company: string;
        role: string;
        duration: string;
        description: string;
        highlights: string[];
      }) => ({
        content: `${exp.role} at ${exp.company} (${exp.duration}). ${exp.description} Key highlights: ${exp.highlights.join("; ")}.`,
        sourceType: "experience" as const,
        sourceId: exp.company.toLowerCase().replace(/\s+/g, "-"),
        metadata: { title: `${exp.role} at ${exp.company}`, url: "/about" },
      }),
    );
  }

  private chunkCertificates(): ContentChunk[] {
    const data = this.readJsonFile("certificates.json");
    if (!data || !Array.isArray(data)) return [];

    return data.map(
      (cert: {
        id: string;
        title: string;
        issuer: string;
        issueDate: string;
      }) => ({
        content: `Certificate: ${cert.title}, issued by ${cert.issuer} on ${cert.issueDate}.`,
        sourceType: "certificate" as const,
        sourceId: cert.id,
        metadata: { title: cert.title, url: "/about" },
      }),
    );
  }

  private async chunkProjects(): Promise<ContentChunk[]> {
    try {
      const projects = await this.prisma.project.findMany();
      return projects.map((p) => ({
        content: `Project: ${p.title}. ${p.description} ${p.longDesc ?? ""}. Technologies: ${p.technologies.join(", ")}. Role: ${p.role ?? "Developer"}. Team: ${p.teamSize ?? "Solo"}. Impact: ${p.impact ?? "N/A"}.`,
        sourceType: "project" as const,
        sourceId: p.slug,
        metadata: { title: p.title, url: "/projects" },
      }));
    } catch (error) {
      this.logger.warn(`Failed to chunk projects: ${error}`);
      return [];
    }
  }

  private async chunkBlogPosts(): Promise<ContentChunk[]> {
    try {
      const posts = await this.prisma.post.findMany({
        where: { type: "BLOG", published: true },
      });

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
      });

      const chunks: ContentChunk[] = [];

      for (const post of posts) {
        const text = this.extractTextFromTiptap(post.content);
        if (!text.trim()) continue;

        const fullText = `${post.title}. ${post.description ?? ""} ${text}`;
        const splits = await splitter.splitText(fullText);

        splits.forEach((split, i) => {
          chunks.push({
            content: split,
            sourceType: "blog",
            sourceId: `${post.slug}-${i}`,
            metadata: { title: post.title, url: `/blog/${post.slug}` },
          });
        });
      }

      return chunks;
    } catch (error) {
      this.logger.warn(`Failed to chunk blog posts: ${error}`);
      return [];
    }
  }

  private extractTextFromTiptap(json: unknown): string {
    if (!json) return "";
    if (typeof json === "string") return json;
    const node = json as Record<string, unknown>;
    if (node.text) return node.text as string;
    if (Array.isArray(node.content)) {
      return node.content
        .map((n: unknown) => this.extractTextFromTiptap(n))
        .join(" ");
    }
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readJsonFile(filename: string): any {
    const filePath = join(this.contentDir, filename);
    try {
      return JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
      this.logger.warn(`Could not read ${filePath}`);
      return null;
    }
  }

  private resolveContentDir(): string {
    const candidates = [
      join(process.cwd(), "apps/web/src/content"),
      join(process.cwd(), "../web/src/content"),
      join(process.cwd(), "content"),
    ];
    for (const dir of candidates) {
      if (existsSync(dir)) return dir;
    }
    this.logger.warn("Content directory not found, using fallback");
    return candidates[0];
  }
}
