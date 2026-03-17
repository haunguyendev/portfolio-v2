import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSeriesInput, UpdateSeriesInput } from "./dto/series.input";

@Injectable()
export class SeriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.series.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    return this.prisma.series.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<any> {
    return this.prisma.series.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { published: true },
          orderBy: { seriesOrder: "asc" },
        },
      },
    });
  }

  async create(input: CreateSeriesInput) {
    return this.prisma.series.create({ data: input });
  }

  async update(id: string, input: UpdateSeriesInput) {
    return this.prisma.series.update({ where: { id }, data: input });
  }

  async delete(id: string) {
    await this.prisma.series.delete({ where: { id } });
    return true;
  }
}
