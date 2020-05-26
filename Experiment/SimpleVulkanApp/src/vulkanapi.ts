/// <reference path="./vulkan.win32.d.ts" />

module vulkan {
    export class Instance {
        static Create(): Instance {
            const inst = new Instance();
            return inst;
        }
    }
}
