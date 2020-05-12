#ifndef UNICODE
//#define UNICODE
#endif 

#pragma comment(linker, "/subsystem:windows")

#include <winsock2.h>
#include <windows.h>
#include <tchar.h>

#include "vulkan.win32.h"

#undef min
#undef max
#include "appwindow.h"

auto appWindow = std::make_unique<AppWindow>();
VulkanApi vulkanApi;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE, LPTSTR pCmdLine, int nCmdShow)
{
    vulkanApi.initialize();
    appWindow->initialize(js::string(pCmdLine));

    // Register the window class.
    const auto CLASS_NAME  = _T("Application Window Class");
    
    WNDCLASS wc = { };

    wc.lpfnWndProc   = WindowProc;
    wc.hInstance     = hInstance;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);

    // Create the window.

    auto hwnd = CreateWindowEx(
        0,                              // Optional window styles.
        CLASS_NAME,                     // Window class
        _T("Application Window"),       // Window text
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

    ShowWindow(hwnd, nCmdShow);

    // Run the message loop.

    vulkanApi.create_surface_win32(hInstance, hwnd);
    vulkanApi.initialize_swapchain();
    vulkanApi.prepare();

    auto run = true;
    auto exit_code = 0;
    MSG msg = { };
    while (run && GetMessage(&msg, NULL, 0, 0))
    {
        if (vulkanApi.pause) {
            const BOOL succ = WaitMessage();

            if (!succ) {
                std::cerr << "WaitMessage() failed on paused app" << std::endl;
                exit(1);
            }
        }

        if (msg.message == WM_QUIT) {
            exit_code = (int)msg.wParam;
            run = false;
        } else {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        RedrawWindow(hwnd, nullptr, nullptr, RDW_INTERNALPAINT);
    }

    vulkanApi.cleanup();    

    return exit_code;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    switch (uMsg)
    {
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;

    case WM_PAINT:
        {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);

            FillRect(hdc, &ps.rcPaint, reinterpret_cast<HBRUSH>((COLOR_WINDOW+1)));

            appWindow->onPaint();

            EndPaint(hwnd, &ps);
        }

        return 0;
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}