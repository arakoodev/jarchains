import { readPdfText } from 'pdf-text-reader';

export class PdfLoader {
    pdfPath: string;
    constructor(pdfPath: string) {
        this.pdfPath = pdfPath;
    }

    async loadPdf() {
        try {
            const pdfText = await readPdfText({ url: this.pdfPath });
            return pdfText
        } catch (error) {
            console.error("Error loading PDF:", error);
            throw error;
        }
    }
}