// Extracts certificate metadata from credential URLs using Cheerio + OG tags
import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { CertificateMetadata } from "./dto/certificate-metadata.output";

/** Platform detection regex patterns */
const PLATFORM_PATTERNS: {
  name: string;
  pattern: RegExp;
  icon: string;
}[] = [
  { name: "Coursera", pattern: /coursera\.org/i, icon: "coursera" },
  { name: "Udemy", pattern: /udemy\.com/i, icon: "udemy" },
  {
    name: "freeCodeCamp",
    pattern: /freecodecamp\.org/i,
    icon: "freecodecamp",
  },
];

/** Allowed hostnames — only fetch from known certificate platforms */
const ALLOWED_HOSTS = [
  "coursera.org",
  "www.coursera.org",
  "udemy.com",
  "www.udemy.com",
  "freecodecamp.org",
  "www.freecodecamp.org",
  "credly.com",
  "www.credly.com",
  "linkedin.com",
  "www.linkedin.com",
];

function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow HTTPS
    if (parsed.protocol !== "https:") return false;
    // Block private/internal IPs and localhost
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("169.254.") ||
      host.startsWith("172.") ||
      host === "0.0.0.0" ||
      host === "[::1]"
    ) {
      return false;
    }
    // Check against allowed hosts
    return ALLOWED_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

@Injectable()
export class CertificateUrlExtractorService {
  private readonly logger = new Logger(CertificateUrlExtractorService.name);

  async extract(url: string): Promise<CertificateMetadata> {
    try {
      // Validate URL before fetching — prevent SSRF
      if (!isUrlSafe(url)) {
        return {
          success: false,
          error:
            "URL not supported. Only Coursera, Udemy, freeCodeCamp, Credly, and LinkedIn HTTPS links are allowed.",
        };
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://haunguyendev.xyz)",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract OG meta tags
      const ogTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().trim();
      const ogDescription =
        $('meta[property="og:description"]').attr("content") || "";
      const ogImage = $('meta[property="og:image"]').attr("content");

      // Detect platform
      const platform = PLATFORM_PATTERNS.find((p) => p.pattern.test(url));

      // Extract issuer — platform-specific or from OG data
      let issuer = platform?.name || "";
      if (!issuer) {
        issuer =
          $('meta[property="og:site_name"]').attr("content") || "Unknown";
      }

      // Try to extract date from page content
      const dateMatch = html.match(
        /(?:issued|completed|date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i
      );
      const issueDate = dateMatch ? dateMatch[1] : undefined;

      // Clean title — remove platform suffix if present
      let title = ogTitle || "";
      if (platform) {
        title = title
          .replace(/\s*\|?\s*Coursera$/i, "")
          .replace(/\s*\|?\s*Udemy$/i, "")
          .replace(/\s*\|?\s*freeCodeCamp$/i, "")
          .trim();
      }

      if (!title) {
        return { success: false, error: "Could not extract title from page" };
      }

      return {
        success: true,
        title,
        issuer,
        issueDate,
        issuerIcon: platform?.icon,
        image: ogImage,
      };
    } catch (err) {
      this.logger.warn(`Failed to extract from ${url}: ${err}`);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch credential URL",
      };
    }
  }
}
