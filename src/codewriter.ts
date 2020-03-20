export class CodeWriter {
    private parts = new Array<string>();
    private intent = 0;
    private pendingIntent = false;
    private newLine = false;
    private endOfStatement = false;

    public newSection(): number {
        return this.parts.length;
    }

    public hasAnyContent(point: number, rollbackPosition?: number): boolean {
        if (point >= this.parts.length) {
            if (rollbackPosition) {
                this.parts.length = rollbackPosition;
            }

            return false;
        }

        return true;
    }

    public BeginBlock() {
        this.writeStringNewLine('{');
        this.IncreaseIntent();
        this.pendingIntent = true;
    }

    public EndBlock(noNewLineAtTheEnd?: boolean) {
        this.DecreaseIntent();
        if (!this.newLine) {
            this.writeStringNewLine('');
        }

        if (noNewLineAtTheEnd) {
            this.writeString('}');
        } else {
            this.writeStringNewLine('}');
        }
    }

    public IncreaseIntent() {
        this.intent += 4;
    }

    public DecreaseIntent() {
        this.intent -= 4;
    }

    public BeginBlockNoIntent() {
        this.writeString('{ ');
    }

    public EndBlockNoIntent() {
        this.writeString(' }');
    }

    public EndOfStatement() {
        if (this.endOfStatement) {
            // cancelling empty statement;
            return;
        }

        this.cancelNewLine();

        this.writeStringNewLine(';');
        this.endOfStatement = true;
    }

    public writeString(data: string): void {
        this.endOfStatement = false;
        if (this.pendingIntent) {
            this.parts.push(' '.repeat(this.intent));
            this.pendingIntent = false;
        }

        this.parts.push(data);
        if (data) {
            this.newLine = false;
        }
    }

    public writeStringNewLine(data?: string): void {
        if (data) {
            this.writeString(data);
        }

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
        } else if (this.parts.length > 0 && this.parts[this.parts.length - 1] === '\n') {
            this.parts.pop();
        }
    }

    public getText(): string {
        return this.parts.join('');
    }
}
