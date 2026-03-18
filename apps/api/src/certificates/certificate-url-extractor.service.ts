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
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const finalUrl = response.url; // URL after redirects
      const html = await response.text();
      const $ = cheerio.load(html);

      // Detect platform from original or final URL
      const platform = PLATFORM_PATTERNS.find(
        (p) => p.pattern.test(url) || p.pattern.test(finalUrl),
      );

      // Extract OG meta tags
      const ogTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().trim();
      const ogDescription =
        $('meta[property="og:description"]').attr("content") || "";
      const ogImage = $('meta[property="og:image"]').attr("content");

      // Try JSON-LD structured data (some platforms embed cert info this way)
      let jsonLdTitle: string | undefined;
      let jsonLdIssuer: string | undefined;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).html() || "{}");
          if (data.name) jsonLdTitle = data.name;
          if (data.provider?.name) jsonLdIssuer = data.provider.name;
          if (data.creator?.name) jsonLdIssuer = data.creator.name;
        } catch {
          // ignore malformed JSON-LD
        }
      });

      // Extract issuer — platform-specific or from OG/JSON-LD data
      let issuer = jsonLdIssuer || platform?.name || "";
      if (!issuer) {
        issuer =
          $('meta[property="og:site_name"]').attr("content") || "Unknown";
      }

      // Try to extract date from page content
      const dateMatch = html.match(
        /(?:issued|completed|date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
      );
      const issueDate = dateMatch ? dateMatch[1] : undefined;

      // Build title — prefer JSON-LD over OG
      let title = jsonLdTitle || ogTitle || "";

      // Clean title — remove platform suffixes and generic Coursera landing text
      if (platform) {
        title = title
          .replace(
            /\s*\|?\s*Coursera\s*\|?\s*Online Courses.*$/i,
            "",
          )
          .replace(/\s*\|?\s*Coursera$/i, "")
          .replace(/\s*\|?\s*Udemy$/i, "")
          .replace(/\s*\|?\s*freeCodeCamp$/i, "")
          .trim();
      }

      // Detect if we got a generic/SPA page instead of actual cert data
      const isGenericPage =
        !title ||
        /online courses/i.test(title) ||
        /join for free/i.test(title) ||
        /learn online/i.test(title);

      if (isGenericPage) {
        // SPA page — return partial success with platform info only
        return {
          success: true,
          title: undefined,
          issuer: platform?.name,
          issueDate: undefined,
          issuerIcon: platform?.icon,
          image: undefined,
          error:
            "This page loads dynamically. Platform detected but title/date need manual entry.",
        };
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
