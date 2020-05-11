declare function init_window(window: AppWindow): void;

class AppWindow {

    width = 300;
    height = 200;
    name = 'Application Window';

    constructor() {
        init_window(this);
    }

    run(): void {
    }

    onPaint(): void {

    }
}
