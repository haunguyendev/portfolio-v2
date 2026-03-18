import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCertificateInput,
  UpdateCertificateInput,
} from "./dto/certificate.input";

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(publishedOnly?: boolean) {
    return this.prisma.certificate.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { sortOrder: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.certificate.findUnique({ where: { id } });
  }

  async create(input: CreateCertificateInput) {
    return this.prisma.certificate.create({ data: input });
  }

  async update(id: string, input: UpdateCertificateInput) {
    return this.prisma.certificate.update({ where: { id }, data: input });
  }

  async delete(id: string) {
    await this.prisma.certificate.delete({ where: { id } });
    return true;
  }
}
