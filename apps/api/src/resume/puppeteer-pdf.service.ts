import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import type { Browser } from "puppeteer-core";

@Injectable()
export class PuppeteerPdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerPdfService.name);
  private browser: Browser | null = null;

  /** Get or lazily launch the browser instance */
  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;

    const puppeteer = await import("puppeteer-core");

    // Resolve Chromium path: env var > common defaults
    const executablePath =
      process.env.CHROMIUM_PATH ||
      "/usr/bin/chromium-browser" // Alpine Docker default

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
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });

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
