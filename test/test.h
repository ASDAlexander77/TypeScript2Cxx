#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
class Test;

template <typename T2>
class ITest : public object {
public:
    union __union34_57 {
        string v0; __union34_57 (string v_) : v0(v_) {}
        js::number v1; __union34_57 (js::number v_) : v1(v_) {}
    } NameT;
};

template <typename T>
class Test : public ITest<T> {
public:
    template <typename RET>
    RET get_NameT();
    template <typename P0>
    void set_NameT(P0 value);
};

template <typename T>
template <typename RET>
RET Test<T>::get_NameT()
{
    return cast<RET>(nullptr);
}

template <typename T>
template <typename P0>
void Test<T>::set_NameT(P0 value)
{
}

#endif
