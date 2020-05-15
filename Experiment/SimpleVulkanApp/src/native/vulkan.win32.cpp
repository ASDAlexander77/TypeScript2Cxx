#define VULKAN_HPP_NO_SMART_HANDLE
#define VULKAN_HPP_NO_EXCEPTIONS
#define VULKAN_HPP_TYPESAFE_CONVERSION
#include <vulkan/vulkan.h>
#include <vulkan/vulkan.hpp>
#include <vulkan/vk_sdk_platform.h>

#include <cassert>
#include <array>
#include <iostream>
#include <string>
#include <sstream>
#include <set>

namespace vk {

inline VkResult assert_success(VkResult res) {
    if (res != VK_SUCCESS) {
        std::stringstream ss;
        ss << "VkResult " << res << " returned";
        throw std::runtime_error(ss.str());
    }

    return res;
}

}

void vk_create_device() {
    VkDeviceCreateInfo dev_info = {};
    dev_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;

    const std::vector<float> queue_priorities(settings_.queue_count, 0.0f);
    std::array<VkDeviceQueueCreateInfo, 2> queue_info = {};
    queue_info[0].sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    queue_info[0].queueFamilyIndex = ctx_.game_queue_family;
    queue_info[0].queueCount = settings_.queue_count;
    queue_info[0].pQueuePriorities = queue_priorities.data();

    if (ctx_.game_queue_family != ctx_.present_queue_family) {
        queue_info[1].sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queue_info[1].queueFamilyIndex = ctx_.present_queue_family;
        queue_info[1].queueCount = 1;
        queue_info[1].pQueuePriorities = queue_priorities.data();

        dev_info.queueCreateInfoCount = 2;
    } else {
        dev_info.queueCreateInfoCount = 1;
    }

    dev_info.pQueueCreateInfos = queue_info.data();
    dev_info.enabledExtensionCount = static_cast<uint32_t>(device_extensions_.size());
    dev_info.ppEnabledExtensionNames = device_extensions_.data();

    // disable all features
    VkPhysicalDeviceFeatures features = {};
    dev_info.pEnabledFeatures = &features;

    vk::assert_success(vk::CreateDevice(ctx_.physical_dev, &dev_info, nullptr, &ctx_.dev));
}
