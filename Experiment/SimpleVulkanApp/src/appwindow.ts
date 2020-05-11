class AppWindow {
    constructor() {
    }

    intialize(commandLine: string): void {
        console.debug('cmd line: ', commandLine);
    }

    onPaint(): void {
        console.debug('on paint...');
    }
}
