
import { chromium } from "playwright";

export class PlayWriteScrapper {

    constructor() { }

    async getContent(url: string): Promise<string> {
        const browser = await chromium.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(url, {
            timeout: 180000,
            waitUntil: "domcontentloaded",
        });

        const textContent = await page.evaluate(() => {
            const extractText = (node) => {

                if (node.nodeType === Node.TEXT_NODE) {
                    return node.nodeValue;
                }
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'IMG' && node.nodeType !== undefined) {
                    console.log(node.childNodes)
                    return Array.from(node.childNodes).map(extractText).join(' ');
                }
            };
            return extractText(document.body);
        });

        await browser.close();
        const regex = new RegExp("\n", "g");
        return textContent.replace(regex, "").replace(/\s{2,}/g, ' ');
    }

}


