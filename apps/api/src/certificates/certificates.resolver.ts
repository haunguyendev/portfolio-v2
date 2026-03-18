import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CertificatesService } from "./certificates.service";
import { CertificateUrlExtractorService } from "./certificate-url-extractor.service";
import { Certificate } from "./models/certificate.model";
import { CertificateMetadata } from "./dto/certificate-metadata.output";
import {
  CreateCertificateInput,
  UpdateCertificateInput,
} from "./dto/certificate.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Certificate)
export class CertificatesResolver {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly urlExtractorService: CertificateUrlExtractorService,
  ) {}

  @Query(() => [Certificate])
  certificates(
    @Args("publishedOnly", { nullable: true }) publishedOnly?: boolean,
  ) {
    return this.certificatesService.findAll(publishedOnly);
  }

  @Query(() => Certificate, { nullable: true })
  certificate(@Args("id", { type: () => ID }) id: string) {
    return this.certificatesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Certificate)
  createCertificate(@Args("input") input: CreateCertificateInput) {
    return this.certificatesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Certificate)
  updateCertificate(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCertificateInput,
  ) {
    return this.certificatesService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteCertificate(@Args("id", { type: () => ID }) id: string) {
    return this.certificatesService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CertificateMetadata)
  extractCertificateUrl(@Args("url") url: string) {
    return this.urlExtractorService.extract(url);
  }
}
