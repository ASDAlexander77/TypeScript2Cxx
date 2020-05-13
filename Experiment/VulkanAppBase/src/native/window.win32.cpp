#ifndef UNICODE
//#define UNICODE
#endif 

#pragma comment(linker, "/subsystem:windows")

#include <winsock2.h>
#include <windows.h>
#include <tchar.h>

#include "vulkan.win32.h"

VulkanApi vulkanApi;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

int WINAPI _tWinMain(HINSTANCE hInstance, HINSTANCE, LPTSTR pCmdLine, int nCmdShow)
{
    vulkanApi.initialize();

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

    vulkanApi.on_create_surface = 
        std::function<void(vk::Instance& inst, vk::SurfaceKHR& surface)>([=] (vk::Instance& inst, vk::SurfaceKHR& surface) {
            auto const createInfo = vk::Win32SurfaceCreateInfoKHR().setHinstance(hInstance).setHwnd(hwnd);
            auto result = inst.createWin32SurfaceKHR(&createInfo, nullptr, &surface);
            VERIFY(result == vk::Result::eSuccess);
            return true;
        });
    vulkanApi.initialize_swapchain();
    vulkanApi.prepare();

    // Run the message loop.
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
        case WM_CLOSE:
            PostQuitMessage(0);
            break;
        case WM_PAINT:
            vulkanApi.run();
            break;
        case WM_GETMINMAXINFO:  // set window's minimum size
            ((MINMAXINFO *)lParam)->ptMinTrackSize = POINT{100, 100};
            return 0;
        case WM_ERASEBKGND:
            return 1;
        case WM_SIZE:
            // Resize the application to the new window size, except when
            // it was minimized. Vulkan doesn't support images or swapchains
            // with width=0 and height=0.
            if (wParam != SIZE_MINIMIZED) {
                vulkanApi.width = lParam & 0xffff;
                vulkanApi.height = (lParam & 0xffff0000) >> 16;
                vulkanApi.resize();
            }
            break;
        case WM_KEYDOWN:
            switch (wParam) {
                case VK_ESCAPE:
                    PostQuitMessage(0);
                    break;
                case VK_LEFT:
                    vulkanApi.spin_angle -= vulkanApi.spin_increment;
                    break;
                case VK_RIGHT:
                    vulkanApi.spin_angle += vulkanApi.spin_increment;
                    break;
                case VK_SPACE:
                    vulkanApi.pause = !vulkanApi.pause;
                    break;
            }
            return 0;
        default:
            break;
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}