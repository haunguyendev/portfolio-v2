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

      // Note: Coursera cert image URLs (/account/accomplishments/.../certificate/ID)
      // return text/html, not actual images — cannot be used as <img src>.
      // Users must screenshot and upload cert images via the dashboard.

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

      // Coursera embeds cert data as JSON inside <script> tags (not JSON-LD)
      // Extract "name" fields from embedded JSON — filter out generic/short values
      let embeddedTitle: string | undefined;
      let embeddedIssuer: string | undefined;
      const nameMatches = html.match(/"name":"([^"]{10,120})"/g);
      if (nameMatches) {
        for (const m of nameMatches) {
          const val = m.replace(/"name":"/, "").replace(/"$/, "");
          // Skip generic values
          if (/unknown|coursera|udemy/i.test(val)) continue;
          // University/org names → issuer
          if (
            /university|institute|college|academy|school/i.test(val)
          ) {
            embeddedIssuer = val;
          } else if (!embeddedTitle) {
            // First non-generic, non-university name → likely cert title
            embeddedTitle = val;
          }
        }
      }

      // Also try certificateDescription for issuer info
      const certDescMatch = html.match(
        /"certificateDescription":"([^"]+)"/,
      );
      if (certDescMatch && !embeddedIssuer) {
        const descIssuerMatch = certDescMatch[1].match(
          /authorized by ([^,."]+)/i,
        );
        if (descIssuerMatch) {
          embeddedIssuer = descIssuerMatch[1].trim();
        }
      }

      // Extract issuer — prefer embedded > JSON-LD > platform > OG
      let issuer =
        embeddedIssuer || jsonLdIssuer || platform?.name || "";
      if (!issuer) {
        issuer =
          $('meta[property="og:site_name"]').attr("content") || "Unknown";
      }

      // Try to extract date — check grantedAt timestamps first (Coursera),
      // then fall back to text pattern matching
      let issueDate: string | undefined;
      const grantedAtMatches = html.match(/"grantedAt":(\d{10,13})/g);
      if (grantedAtMatches && grantedAtMatches.length > 0) {
        // Use the latest grantedAt (last one = specialization completion)
        const lastTs = parseInt(
          grantedAtMatches[grantedAtMatches.length - 1].split(":")[1],
        );
        issueDate = new Date(lastTs).toISOString().split("T")[0];
      }
      if (!issueDate) {
        const dateMatch = html.match(
          /(?:issued|completed|date)[:\s]*(\w+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
        );
        issueDate = dateMatch ? dateMatch[1] : undefined;
      }

      // Build title — prefer embedded > JSON-LD > OG
      let title = embeddedTitle || jsonLdTitle || ogTitle || "";

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
