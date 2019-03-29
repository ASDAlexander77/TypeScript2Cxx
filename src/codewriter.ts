export class CodeWriter {
    private parts = new Array<string>();
    private intent = 0;
    private pendingIntent = false;
    private newLine = false;

    public BeginBlock() {
        this.intent += 4;
        this.writeStringNewLine('{');
    }

    public EndBlock(noNewLineAtTheEnd?: boolean) {
        this.intent -= 4;

        if (!this.newLine) {
            this.writeStringNewLine('');
        }

        if (noNewLineAtTheEnd) {
            this.writeString('}');
        } else {
            this.writeStringNewLine('}');
        }
    }

    public BeginBlockNoIntent() {
        this.writeStringNewLine('{ ');
    }

    public EndBlockNoIntent() {
        this.writeStringNewLine(' }');
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

    public cancelNewLine() {
        if (this.newLine) {
            this.pendingIntent = false;
            this.newLine = false;
            this.parts.pop();
        }
    }

    public getText(): string {
        return this.parts.join('');
    }
}
