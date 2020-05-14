type callback_function = (uMsg: uint64_t, wParam: uint64_t, lParam: uint64_t) => uint64_t;
declare function create_window(title: string, handler: callback_function): uint64_t;
declare function messages_loop(hwnd: uint64_t): void;
type uint64_t = number;

class AppWindow {
    private hwnd: uint64_t;

    constructor() {
        this.hwnd = create_window('Hello World!', this.onMessage);
    }

    public run() {
        messages_loop(this.hwnd);
    }

    protected onMessage(uMsg: uint64_t, wParam: uint64_t, lParam: uint64_t): uint64_t {
        return 0;
    }
}
