export class CodeWriter {
    private parts = new Array<string>();

    public writeString(data: string): void {
        this.parts.push(data);
    }

    public writeStringNewLine(data: string): void {
        this.writeString(data);
        this.parts.push('\n');

    }

    public getText(): string {
        return this.parts.join('');
    }
}
