import { Module } from "@nestjs/common";
import { CertificatesService } from "./certificates.service";
import { CertificatesResolver } from "./certificates.resolver";
import { CertificateUrlExtractorService } from "./certificate-url-extractor.service";

@Module({
  providers: [
    CertificatesService,
    CertificatesResolver,
    CertificateUrlExtractorService,
  ],
  exports: [CertificatesService],
})
export class CertificatesModule {}
