import './vulkanapi';

type uint32_t = number;
type uint64_t = number;
type intptr_t = number;

type callback_function = (uMsg: uint64_t, wParam: uint64_t, lParam: uint64_t) => uint32_t;
declare function create_window(title: string, parent_hwnd: intptr_t, handler: callback_function): intptr_t;
declare function close_window(exitCode: uint32_t): void;
declare function destroy_window(hwnd: intptr_t): uint32_t;

declare function create_vulkan(hwnd: intptr_t): void;
declare function run_vulkan(): void;
declare function cleanup_vulkan(): void;

enum Messages {
    Destroy = 0x0002,
    Size = 0x0005,
    Paint = 0x000f,
    KeyDown = 0x0100,
    Erasebkgnd = 0x0014
}

enum Keys {
    Escape = 0x1b,
    Space = 0x20
}

export class AppWindow {

    private handler_window: intptr_t;

    constructor(parent_handler_window?: intptr_t) {
        this.handler_window = create_window('Hello World!', parent_handler_window, this.onMessage);
        create_vulkan(this.handler_window);
    }

    protected onMessage(uMsg: uint64_t, wParam: uint64_t, lParam: uint64_t): uint32_t {
        switch (uMsg) {
            case Messages.Erasebkgnd:
                return 1;
            case Messages.Paint:
                run_vulkan();
                break;
            case Messages.Destroy:
                cleanup_vulkan();
                break;
            case Messages.KeyDown: // key down
                switch (wParam) {
                    case Keys.Escape: // key escape
                        close_window(0);
                        break;
                    case Keys.Space: // key space
                        // open new window
                        break;
                }

                return 0;
        }

        return 0;
    }
}
