export class CodeWriter {
    private parts = new Array<string>();
    private intent = 0;
    private pendingIntent = false;
    private newLine = false;

    public BeginBlock() {
        this.intent += 4;
        this.writeStringNewLine('{');
    }

    public EndBlock() {
        this.intent -= 4;

        if (!this.newLine) {
            this.writeStringNewLine('');
        }

        this.writeStringNewLine('}');
    }

    public writeString(data: string): void {
        if (this.pendingIntent) {
            this.parts.push(' '.repeat(this.intent));
            this.pendingIntent = false;
        }

        this.parts.push(data);
        if (data) {
            this.newLine = false;
        }
    }

    public writeStringNewLine(data: string): void {
        this.writeString(data);
        this.parts.push('\n');
        this.newLine = true;
        if (this.intent > 0) {
            this.pendingIntent = true;
        }
    }

    public getText(): string {
        return this.parts.join('');
    }
}
