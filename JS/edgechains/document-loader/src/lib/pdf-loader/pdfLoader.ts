import pdf from "pdf-parse/lib/pdf-parse"

export class PdfLoader {
    pdfBuffer : SourceBuffer;

    constructor(pdfBuffer: SourceBuffer) {
        this.pdfBuffer = pdfBuffer;
    }

    async loadPdf() {
        try {
            const pdfdata = await pdf(this.pdfBuffer)
            return pdfdata.text;
        } catch (error) {
            console.error("Error loading PDF:", error);
            throw error;
        }
    }
}