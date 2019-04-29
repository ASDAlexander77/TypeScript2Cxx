#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Cls;

class Cls {
public:
    virtual void dummy() {};
    template <typename P0, typename P1>
    js::number test(P0 value1, P1 value2);
};

template <typename P0, typename P1>
js::number Cls::test(P0 value1, P1 value2)
{
    return 1;
}

#endif
