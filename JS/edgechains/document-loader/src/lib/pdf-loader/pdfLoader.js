"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfLoader = void 0;
const pdf_text_reader_1 = require("pdf-text-reader");
class PdfLoader {
    pdfPath;
    constructor(pdfPath) {
        this.pdfPath = pdfPath;
    }
    async loadPdf() {
        try {
            const pdfText = await (0, pdf_text_reader_1.readPdfText)({ url: this.pdfPath });
            return pdfText;
        }
        catch (error) {
            console.error("Error loading PDF:", error);
            throw error;
        }
    }
}
exports.PdfLoader = PdfLoader;
