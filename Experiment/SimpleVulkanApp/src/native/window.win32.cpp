#ifndef UNICODE
//#define UNICODE
#endif 

#pragma comment(linker, "/subsystem:windows")

#include <winsock2.h>
#include <windows.h>
#include <tchar.h>

#undef min
#undef max
#include "core.h"

static HINSTANCE instance;
static int cmdShow;
const char* CLASS_NAME = "Application Window";

typedef std::function<js::number(js::number, js::number, js::number)> callback_function;

std::vector<std::shared_ptr<callback_function>> callbacks;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

void register_window_class() {
    // Register the window class.
    WNDCLASS wc = { };

    wc.lpfnWndProc   = WindowProc;
    wc.hInstance     = instance;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);
}

js::number create_window(js::string title, callback_function window_callback) {
    // Create the window.
    auto hwnd = CreateWindowEx(
        0,                              // Optional window styles.
        CLASS_NAME,                     // Window class
        title,       // Window text
        WS_OVERLAPPEDWINDOW,            // Window style

        // Size and position
        CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,

        NULL,       // Parent window    
        NULL,       // Menu
        instance,   // Instance handle
        NULL        // Additional application data
        );

    auto call_func_ptr = std::make_shared<callback_function>(window_callback);
    callbacks.push_back(call_func_ptr);
    SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR) call_func_ptr.get());

    ShowWindow(hwnd, cmdShow);

    return hwnd;
}

void messages_loop(js::number hwnd) {
    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
        RedrawWindow((HWND)static_cast<size_t>(hwnd), nullptr, nullptr, RDW_INTERNALPAINT);
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

    return 0;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    bool result = false;
    auto *callback_function_ptr = reinterpret_cast<callback_function*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    if (callback_function_ptr) {
        auto &callback = *callback_function_ptr;
        callback(js::number(uMsg), js::number(wParam), js::number(lParam));
    }

    switch (uMsg) {
        case WM_CLOSE:
            PostQuitMessage(0);
            return 0;
        case WM_KEYDOWN:
            switch (wParam) {
                case VK_ESCAPE:
                    PostQuitMessage(0);
                    return 0;
            }

        default:
            break;
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}