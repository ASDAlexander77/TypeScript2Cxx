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
    std::vector<std::string> extension_names;
    std::vector<std::string> enabled_layers;

    VulkanApi() : extension_names{}, enabled_layers{} {
    }

    bool initialize() {
        return validate();
    }

    bool validate() {
        uint32_t instance_layer_count = 0;
        std::array<std::string_view, 1> instance_validation_layers = {"VK_LAYER_KHRONOS_validation"};

        // Look for validation layers
        vk::Bool32 validation_found = VK_FALSE;
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

private:
    void error(std::string_view msg, std::string_view group) {
        std::cerr << group << ": " << msg << std::endl;
        exit(1);
    }
};