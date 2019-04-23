#include "core.h"

using namespace js;

class Scene {
public:
    virtual void dummy() {};
};
typedef std::function<void(number)> ActiveMeshStageAction;
typedef Scene SceneType;
