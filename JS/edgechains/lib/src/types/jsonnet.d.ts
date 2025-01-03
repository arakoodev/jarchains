declare module '@arakoodev/jsonnet' {
    export class Jsonnet {
        constructor();
        evaluateFile(path: string): Record<string, any>;
        evaluateSnippet(code: string): Record<string, any>;
    }
}
