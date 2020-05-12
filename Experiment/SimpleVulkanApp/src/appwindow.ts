class AppWindow {
    constructor() {
    }

    initialize(commandLine: string): void {
        console.debug('cmd line: ', commandLine);
    }

    onPaint(): void {
        console.debug('on paint...');
    }
}
