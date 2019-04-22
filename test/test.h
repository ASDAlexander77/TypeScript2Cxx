#include "core.h"

using namespace js;

class IFace {
public:
    virtual void dummy() {};
    virtual number run() = 0;
};
