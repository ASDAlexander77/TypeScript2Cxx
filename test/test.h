#include "core.h"

using namespace js;

class SSS {
public:
    virtual void dummy() {};
    template <typename T> static
    void f(boolean a = true)
    {
    }
};
