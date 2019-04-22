#include "core.h"

using namespace js;

class ITest {
public:
    virtual void dummy() {};
    virtual void abort() = 0;
};
class Test : public ITest {
public:
    virtual void abort()
    {
    }
};
