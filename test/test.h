#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test : public object {
public:
    template <typename RET>
    RET get_NameT();
    template <typename P0>
    void set_NameT(P0 value);
};

template <typename RET>
RET Test::get_NameT()
{
    return cast<RET>(nullptr);
}

template <typename P0>
void Test::set_NameT(P0 value)
{
}

#endif
