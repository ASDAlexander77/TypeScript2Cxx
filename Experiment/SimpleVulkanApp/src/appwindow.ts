declare function create_window(title: string, winObj: any): any;

class AppWindow {
    private hwnd: any;

    constructor() {
        this.hwnd = create_window('Hello World!', this);
    }

    run() {
    }
}
