#pragma comment(linker, "/subsystem:windows")

#include <windows.h>
#include <tchar.h>

#undef min
#undef max
#include "core.h"

static HINSTANCE instance;
static int cmdShow;
const TCHAR* CLASS_NAME = TEXT("Application Window");

typedef std::function<uint32_t(uint64_t, uint64_t, uint64_t)> callback_function;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

void register_window_class() {
    // Register the window class.
    WNDCLASS wc = { };

    wc.lpfnWndProc   = WindowProc;
    wc.hInstance     = instance;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);
}

uint32_t show_window(intptr_t hwnd, uint32_t cmdShow) {
    return ShowWindow(reinterpret_cast<HWND>(hwnd), cmdShow);
}

uint32_t destroy_window(intptr_t hwnd) {
    return DestroyWindow(reinterpret_cast<HWND>(hwnd));
}

void close_window(uint32_t exitCode) {
    PostQuitMessage(exitCode);
}

intptr_t create_window(js::string title, intptr_t parent_hwnd, callback_function window_callback) {
    // Create the window.
    auto hwnd = CreateWindowEx(
        0,                              // Optional window styles.
        CLASS_NAME,                     // Window class
        title,       // Window text
        WS_OVERLAPPEDWINDOW,            // Window style

        // Size and position
        CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,

        (HWND)parent_hwnd,       // Parent window    
        NULL,       // Menu
        instance,   // Instance handle
        NULL        // Additional application data
        );

    auto method_ptr = new callback_function(window_callback);
    SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR) method_ptr);

    show_window(reinterpret_cast<intptr_t>(hwnd), cmdShow);

    return reinterpret_cast<intptr_t>(hwnd);
}

void messages_loop() {
    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
}

extern void Main(void);

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE, LPTSTR pCmdLine, int nCmdShow)
{
    instance = hInstance;
    cmdShow = nCmdShow;

    register_window_class();

    // main inject
    Main();

    messages_loop();

    return 0;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    bool result = false;
    auto callback_function_ptr = reinterpret_cast<callback_function*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    if (callback_function_ptr) {
        callback_function_ptr->operator()(uMsg, wParam, lParam);

        switch (uMsg) {
            case WM_DESTROY:
                SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR) nullptr);
                delete callback_function_ptr;                
        }
    }

    RedrawWindow(hwnd, nullptr, nullptr, RDW_INTERNALPAINT);

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}