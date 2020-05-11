#ifndef UNICODE
#define UNICODE
#endif 

#pragma comment(linker, "/subsystem:windows")

#include <winsock2.h>
#include <windows.h>

#include <vulkan/vulkan.h>

#undef min
#undef max

#include "appwindow.h"

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR pCmdLine, int nCmdShow)
{
    auto appWindow = new AppWindow();

    // Register the window class.
    const wchar_t CLASS_NAME[]  = L"Application Window Class";
    
    WNDCLASS wc = { };

    wc.lpfnWndProc   = WindowProc;
    wc.hInstance     = hInstance;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);

    // Create the window.

    HWND hwnd = CreateWindowEx(
        0,                              // Optional window styles.
        CLASS_NAME,                     // Window class
        L"Application Window",    // Window text
        WS_OVERLAPPEDWINDOW,            // Window style

        // Size and position
        CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,

        NULL,       // Parent window    
        NULL,       // Menu
        hInstance,  // Instance handle
        NULL        // Additional application data
        );

    if (hwnd == NULL)
    {
        return 0;
    }

    SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR)appWindow);

    ShowWindow(hwnd, nCmdShow);

    // Run the message loop.

    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    auto* appWindow = reinterpret_cast<AppWindow *>(GetWindowLongPtr(hwnd, GWLP_USERDATA));

    switch (uMsg)
    {
    case WM_DESTROY:
        delete appWindow;
        PostQuitMessage(0);
        return 0;

    case WM_PAINT:
        {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);

            FillRect(hdc, &ps.rcPaint, (HBRUSH) (COLOR_WINDOW+1));

            appWindow->onPaint();

            EndPaint(hwnd, &ps);
        }

        return 0;
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}