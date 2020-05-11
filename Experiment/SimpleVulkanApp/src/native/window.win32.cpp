#include <winsock2.h>
#include <windows.h>
#include <assert.h>

#include <vulkan/vulkan.h>

#undef min
#undef max

#include "appwindow.h"

struct window_data
{
    HINSTANCE connection;        // hInstance - Windows Instance
    HWND window;                 // hWnd - window handle

    VkInstance inst;
    VkSurfaceKHR surface;

    std::shared_ptr<AppWindow> appWindow;

    window_data(std::shared_ptr<AppWindow> appWindow_) : appWindow(appWindow_) {}
};

// MS-Windows event handling function:
LRESULT CALLBACK WndProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    auto data = reinterpret_cast<window_data*>(GetWindowLongPtr(hWnd, GWLP_USERDATA));
    switch (uMsg) {
        case WM_CLOSE:
            delete data;
            PostQuitMessage(0);
            break;
        case WM_PAINT:
            data->appWindow->onPaint();
            return 0;
        default:
            break;
    }

    return (DefWindowProc(hWnd, uMsg, wParam, lParam));
}

void init_window(std::shared_ptr<AppWindow> appWindow) {
    auto* data = new window_data(appWindow);
    data->appWindow = appWindow;

    WNDCLASSEX win_class;
    assert(appWindow->width > 0);
    assert(appWindow->height > 0);

    data.connection = GetModuleHandle(NULL);

    // Initialize the window class structure:
    win_class.cbSize = sizeof(WNDCLASSEX);
    win_class.style = CS_HREDRAW | CS_VREDRAW;
    win_class.lpfnWndProc = WndProc;
    win_class.cbClsExtra = 0;
    win_class.cbWndExtra = 0;
    win_class.hInstance = data.connection;  // hInstance
    win_class.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    win_class.hCursor = LoadCursor(NULL, IDC_ARROW);
    win_class.hbrBackground = (HBRUSH)GetStockObject(WHITE_BRUSH);
    win_class.lpszMenuName = NULL;
    win_class.lpszClassName = appWindow->name;
    win_class.hIconSm = LoadIcon(NULL, IDI_WINLOGO);
    // Register window class:
    if (!RegisterClassEx(&win_class)) {
        // It didn't work, so try to give a useful error:
        std::cerr << "Unexpected error trying to start the application!" << std::endl;
        exit(1);
    }
    // Create window with the registered class:
    RECT wr = {0, 0, appWindow->width, appWindow->height};
    AdjustWindowRect(&wr, WS_OVERLAPPEDWINDOW, FALSE);
    data->window = CreateWindowEx(0,
                                 appWindow->name,        // class name
                                 appWindow->name,        // app name
                                 WS_OVERLAPPEDWINDOW |// window style
                                     WS_VISIBLE | WS_SYSMENU,
                                 100, 100,            // x/y coords
                                 wr.right - wr.left,  // width
                                 wr.bottom - wr.top,  // height
                                 NULL,                // handle to parent
                                 NULL,                // handle to menu
                                 data.connection,  // hInstance
                                 NULL);               // no extra parameters
    if (!data->window) {
        // It didn't work, so try to give a useful error:
        std::cerr << "Cannot create a window in which to draw!" << std::endl;
        exit(1);
    }

    SetWindowLongPtr(data->window, GWLP_USERDATA, (LONG_PTR)&data);
}

/*
void destroy_window(std::shared_ptr<AppWindow> window) {
    vkDestroySurfaceKHR(data.inst, data.surface, NULL);
    DestroyWindow(data.window);
}
*/

