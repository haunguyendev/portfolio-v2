import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostInput, UpdatePostInput, PostsFilterInput } from "./dto/post.input";

const POST_INCLUDE = {
  category: true,
  series: true,
  tags: { include: { tag: true } },
} as const;

function mapPost(post: any) {
  return {
    ...post,
    tags: post.tags?.map((pt: any) => pt.tag) ?? [],
  };
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: PostsFilterInput) {
    const where: any = {};
    if (filter?.type !== undefined) where.type = filter.type;
    if (filter?.published !== undefined) where.published = filter.published;
    if (filter?.featured !== undefined) where.featured = filter.featured;
    if (filter?.categoryId) where.categoryId = filter.categoryId;
    if (filter?.seriesId) where.seriesId = filter.seriesId;
    if (filter?.tagIds?.length) {
      where.tags = { some: { tagId: { in: filter.tagIds } } };
    }
    const posts = await this.prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return posts.map(mapPost);
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    return post ? mapPost(post) : null;
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: POST_INCLUDE,
    });
    return post ? mapPost(post) : null;
  }

  async create(authorId: string, input: CreatePostInput) {
    const { tagIds, content, ...data } = input;
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: content as any,
        coverImage: data.coverImage,
        published: data.published ?? false,
        featured: data.featured ?? false,
        type: data.type as any,
        readingTime: data.readingTime,
        mood: data.mood,
        categoryId: data.categoryId,
        seriesId: data.seriesId,
        seriesOrder: data.seriesOrder,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        ogImage: data.ogImage,
        authorId,
        publishedAt: data.published ? new Date() : null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: POST_INCLUDE,
    });
    return mapPost(post);
  }

  async update(id: string, input: UpdatePostInput) {
    const { tagIds, ...data } = input;
    const updateData: any = { ...data };

    if (data.published === true) {
      const existing = await this.prisma.post.findUnique({ where: { id } });
      if (!existing?.publishedAt) updateData.publishedAt = new Date();
    }

    if (tagIds !== undefined) {
      await this.prisma.postTag.deleteMany({ where: { postId: id } });
      updateData.tags = tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined;
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: POST_INCLUDE,
    });
    return mapPost(post);
  }

  async publish(id: string) {
    const post = await this.prisma.post.update({
      where: { id },
      data: { published: true, publishedAt: new Date() },
      include: POST_INCLUDE,
    });
    return mapPost(post);
  }

  async delete(id: string) {
    await this.prisma.post.delete({ where: { id } });
    return true;
  }
}
