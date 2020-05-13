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
const char* CLASS_NAME = "Application Window";

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

void register_window_class() {
    // Register the window class.
    WNDCLASS wc = { };

    wc.lpfnWndProc   = WindowProc;
    wc.hInstance     = instance;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);
}

js::any create_window(js::string title, js::any class_obj) {
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

    SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR) nullptr);

    return hwnd;
}

int window_loop() {
    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

extern void Main(void);

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE, LPTSTR pCmdLine, int nCmdShow)
{
    instance = hInstance;
    register_window_class();

    // main inject
    Main();

    return window_loop();
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    auto *class_obj = reinterpret_cast<void*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));

    switch (uMsg)
    {
        case WM_CLOSE:
            PostQuitMessage(0);
            break;
        case WM_PAINT:
            break;
        case WM_GETMINMAXINFO:  // set window's minimum size
            ((MINMAXINFO *)lParam)->ptMinTrackSize = POINT{100, 100};
            return 0;
        case WM_ERASEBKGND:
            return 1;
        case WM_SIZE:
            break;
        case WM_KEYDOWN:
            switch (wParam) {
                case VK_ESCAPE:
                    PostQuitMessage(0);
                    break;
                case VK_LEFT:
                    break;
                case VK_RIGHT:
                    break;
                case VK_SPACE:
                    break;
            }
            return 0;
        default:
            break;
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}