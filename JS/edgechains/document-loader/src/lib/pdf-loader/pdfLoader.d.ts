export declare class PdfLoader {
    pdfPath: string;
    constructor(pdfPath: string);
    loadPdf(): Promise<string>;
}
