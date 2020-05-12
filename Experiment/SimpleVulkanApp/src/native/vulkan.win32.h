#define VULKAN_HPP_NO_SMART_HANDLE
#define VULKAN_HPP_NO_EXCEPTIONS
#define VULKAN_HPP_TYPESAFE_CONVERSION
#include <vulkan/vulkan.h>
#include <vulkan/vulkan.hpp>
#include <vulkan/vk_sdk_platform.h>

#include <iostream>

#ifndef NDEBUG
#define VERIFY(x) assert(x)
#else
#define VERIFY(x) ((void)(x))
#endif

struct VulkanApi {
public:    
    std::vector<std::string> enabled_extensions;
    std::vector<std::string> enabled_layers;
    vk::Instance inst;
    vk::PhysicalDevice gpu;

    VulkanApi() : enabled_extensions{}, enabled_layers{} {
    }

    auto initialize() {
        return validate() 
            || load_surface_extentions()
            || create_instance()
            || load_swapchain_extention();
    }

    bool validate() {
        uint32_t instance_layer_count = 0;
        std::array<std::string_view, 1> instance_validation_layers = {"VK_LAYER_KHRONOS_validation"};

        // Look for validation layers
        auto validation_found = false;
        auto result = vk::enumerateInstanceLayerProperties(&instance_layer_count, static_cast<vk::LayerProperties *>(nullptr));
        VERIFY(result == vk::Result::eSuccess);

        if (instance_layer_count > 0) {
            std::unique_ptr<vk::LayerProperties[]> instance_layers(new vk::LayerProperties[instance_layer_count]);
            result = vk::enumerateInstanceLayerProperties(&instance_layer_count, instance_layers.get());
            VERIFY(result == vk::Result::eSuccess);

            std::for_each_n(instance_layers.get(), instance_layer_count, [&] (auto& instance_layer) {
                auto& found = std::find_if(instance_validation_layers.begin(), instance_validation_layers.end(), [&] (auto& instance_validation_layer) {
                    return instance_layer.layerName == instance_validation_layer;
                });

                if (found != instance_validation_layers.end()) {
                    enabled_layers.push_back(instance_layer.layerName);
                }
            });
        }

        if (!enabled_layers.size()) {
            error(
                "vkEnumerateInstanceLayerProperties failed to find required validation layer.\n\n"
                "Please look at the Getting Started guide for additional information.\n",
                "vkCreateInstance Failure");
        }

        return true;
    }

    bool load_surface_extentions() {
        /* Look for instance extensions */
        auto surfaceExtFound = false;
        auto platformSurfaceExtFound = false;

        uint32_t instance_extension_count = 0;
        auto result = vk::enumerateInstanceExtensionProperties(nullptr, &instance_extension_count, static_cast<vk::ExtensionProperties *>(nullptr));
        VERIFY(result == vk::Result::eSuccess);

        if (instance_extension_count > 0) {
            auto instance_extensions = std::make_unique<vk::ExtensionProperties[]>(instance_extension_count);
            result = vk::enumerateInstanceExtensionProperties(nullptr, &instance_extension_count, instance_extensions.get());
            VERIFY(result == vk::Result::eSuccess);

            std::for_each_n(instance_extensions.get(), instance_extension_count, [&] (auto& instance_extension) {
                if (std::string_view(VK_KHR_SURFACE_EXTENSION_NAME) == std::string_view(instance_extension.extensionName)) {
                    surfaceExtFound = true;
                    enabled_extensions.push_back(VK_KHR_SURFACE_EXTENSION_NAME);

                }
#if defined(VK_USE_PLATFORM_WIN32_KHR)
                if (std::string_view(VK_KHR_SURFACE_EXTENSION_NAME) == std::string_view(instance_extension.extensionName) ) {
                    platformSurfaceExtFound = true;
                    enabled_extensions.push_back(VK_KHR_WIN32_SURFACE_EXTENSION_NAME);
                }
#endif
            });
        }

        if (!surfaceExtFound) {
            error("vkEnumerateInstanceExtensionProperties failed to find the " VK_KHR_SURFACE_EXTENSION_NAME
                    " extension.\n\n"
                    "Do you have a compatible Vulkan installable client driver (ICD) installed?\n"
                    "Please look at the Getting Started guide for additional information.\n",
                    "vkCreateInstance Failure");
        }

        if (!platformSurfaceExtFound) {
#if defined(VK_USE_PLATFORM_WIN32_KHR)
            error("vkEnumerateInstanceExtensionProperties failed to find the " VK_KHR_WIN32_SURFACE_EXTENSION_NAME
                    " extension.\n\n"
                    "Do you have a compatible Vulkan installable client driver (ICD) installed?\n"
                    "Please look at the Getting Started guide for additional information.\n",
                    "vkCreateInstance Failure");
#endif
        }        

        return surfaceExtFound || platformSurfaceExtFound;
    }

    bool create_instance() {
        auto const app = vk::ApplicationInfo()
                            .setPApplicationName("App")
                            .setApplicationVersion(0)
                            .setPEngineName("App")
                            .setEngineVersion(0)
                            .setApiVersion(VK_API_VERSION_1_0);

        auto count = 0;
        auto enabled_layers_pnames = std::make_unique<const char*[]>(enabled_layers.size());
        std::for_each(enabled_layers.begin(), enabled_layers.end(), [&] (auto& enabled_layer) {
            enabled_layers_pnames[count++] = enabled_layer.c_str();
        });

        count = 0;
        auto enabled_extensions_pnames = std::make_unique<const char*[]>(enabled_extensions.size());
        std::for_each(enabled_extensions.begin(), enabled_extensions.end(), [&] (auto& enabled_extension) {
            enabled_extensions_pnames[count++] = enabled_extension.c_str();
        });        

        auto const inst_info = vk::InstanceCreateInfo()
                                .setPApplicationInfo(&app)
                                .setEnabledLayerCount(static_cast<uint32_t>(enabled_layers.size()))
                                .setPpEnabledLayerNames(enabled_layers_pnames.get())
                                .setEnabledExtensionCount(static_cast<uint32_t>(enabled_extensions.size()))
                                .setPpEnabledExtensionNames(enabled_extensions_pnames.get());

        auto result = vk::createInstance(&inst_info, nullptr, &inst);

        if (result == vk::Result::eErrorIncompatibleDriver) {
            error(
                "Cannot find a compatible Vulkan installable client driver (ICD).\n\n"
                "Please look at the Getting Started guide for additional information.\n",
                "vkCreateInstance Failure");
        } else if (result == vk::Result::eErrorExtensionNotPresent) {
            error(
                "Cannot find a specified extension library.\n"
                "Make sure your layers path is set appropriately.\n",
                "vkCreateInstance Failure");
        } else if (result != vk::Result::eSuccess) {
            error(
                "vkCreateInstance failed.\n\n"
                "Do you have a compatible Vulkan installable client driver (ICD) installed?\n"
                "Please look at the Getting Started guide for additional information.\n",
                "vkCreateInstance Failure");
        }        

        return true;
    }

    bool load_swapchain_extention() {
        /* Look for device extensions */
        uint32_t device_extension_count = 0;
        bool swapchainExtFound = false;

        /* Make initial call to query gpu_count, then second call for gpu info*/
        uint32_t gpu_count;
        auto result = inst.enumeratePhysicalDevices(&gpu_count, static_cast<vk::PhysicalDevice *>(nullptr));
        VERIFY(result == vk::Result::eSuccess);

        if (gpu_count > 0) {
            auto physical_devices = std::make_unique<vk::PhysicalDevice[]>(gpu_count);
            result = inst.enumeratePhysicalDevices(&gpu_count, physical_devices.get());
            VERIFY(result == vk::Result::eSuccess);
            /* For this app we just grab the first physical device */
            gpu = physical_devices[0];
        } else {
            error(
                "vkEnumeratePhysicalDevices reported zero accessible devices.\n\n"
                "Do you have a compatible Vulkan installable client driver (ICD) installed?\n"
                "Please look at the Getting Started guide for additional information.\n",
                "vkEnumeratePhysicalDevices Failure");
        }        

        result = gpu.enumerateDeviceExtensionProperties(nullptr, &device_extension_count, static_cast<vk::ExtensionProperties *>(nullptr));
        VERIFY(result == vk::Result::eSuccess);

        if (device_extension_count > 0) {
            auto device_extensions = std::make_unique<vk::ExtensionProperties[]>(device_extension_count);
            result = gpu.enumerateDeviceExtensionProperties(nullptr, &device_extension_count, device_extensions.get());
            VERIFY(result == vk::Result::eSuccess);

            std::for_each_n(device_extensions.get(), device_extension_count, [&] (auto& device_extension) {
                if (std::string_view(VK_KHR_SWAPCHAIN_EXTENSION_NAME) == std::string_view(device_extension.extensionName)) {
                    swapchainExtFound = true;
                    enabled_extensions.push_back(VK_KHR_SWAPCHAIN_EXTENSION_NAME);
                }
            });
        }

        if (!swapchainExtFound) {
            error("vkEnumerateDeviceExtensionProperties failed to find the " VK_KHR_SWAPCHAIN_EXTENSION_NAME
                    " extension.\n\n"
                    "Do you have a compatible Vulkan installable client driver (ICD) installed?\n"
                    "Please look at the Getting Started guide for additional information.\n",
                    "vkCreateInstance Failure");
        }

        return swapchainExtFound;
    }

private:
    void error(std::string_view msg, std::string_view group) {
        std::cerr << group << ": " << msg << std::endl;
        exit(1);
    }
};