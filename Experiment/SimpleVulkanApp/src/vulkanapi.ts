declare function vk_create_device(): void;

export class VulkanApi {

    public CreateContext() {
        vk_create_device();
    }
}
