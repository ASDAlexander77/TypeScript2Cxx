import 'vulkan.win32';

export module vulkan {
    export class Instance {
        static Create(): Instance {
            const inst = new Instance();
            return inst;
        }
    }
}
