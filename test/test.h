#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class T;

template <typename T>
using DeepImmutableObject = T;

class T : public object {
public:
    template <typename P0>
    void test(P0 a);
};

template <typename P0>
void T::test(P0 a)
{
}

#endif
