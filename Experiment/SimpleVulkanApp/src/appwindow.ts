declare function create_window(title: string, winObj: (uMsg: number, wParam: number, lParam: number) => number): number;
declare function messages_loop(hwnd: number): void;
type uint32_t = number;

class AppWindow {
    private hwnd: uint32_t;

    constructor() {
        const m1 = this.onMessage;
        this.hwnd = create_window('Hello World!', m1);
    }

    public run() {
        messages_loop(this.hwnd);
    }

    protected onMessage(uMsg: number, wParam: number, lParam: number): number {
        return 0;
    }
}
