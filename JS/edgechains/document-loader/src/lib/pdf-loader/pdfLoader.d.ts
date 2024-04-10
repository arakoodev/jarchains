export declare class PdfLoader {
    pdfBuffer: SourceBuffer;
    constructor(pdfBuffer: SourceBuffer);
    loadPdf(): Promise<any>;
}
