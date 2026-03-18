import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import { existsSync } from "fs";
import type { Browser } from "puppeteer-core";

/** Common Chromium/Chrome paths by platform */
const CHROMIUM_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  // macOS
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  // Linux / Docker Alpine
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter(Boolean) as string[];

@Injectable()
export class PuppeteerPdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerPdfService.name);
  private browser: Browser | null = null;

  /** Get or lazily launch the browser instance */
  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;

    const puppeteer = await import("puppeteer-core");

    // Find first available Chromium/Chrome binary
    const executablePath = CHROMIUM_CANDIDATES.find((p) => existsSync(p));
    if (!executablePath) {
      throw new Error(
        `Chromium not found. Set CHROMIUM_PATH env var. Searched: ${CHROMIUM_CANDIDATES.join(", ")}`,
      );
    }

    this.logger.log(`Launching Chromium from: ${executablePath}`);

    this.browser = await puppeteer.default.launch({
      executablePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    return this.browser;
  }

  /** Generate a PDF buffer from an HTML string */
  async generatePdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      // Puppeteer returns Uint8Array, convert to Buffer
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /** Close browser on module destroy */
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log("Chromium browser closed");
    }
  }
}
