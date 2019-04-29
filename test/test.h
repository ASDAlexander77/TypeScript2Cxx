#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

typedef union __union8_31 {
    js::number v0; __union8_31 (js::number v_) : v0(v_) {}
    string v1; __union8_31 (string v_) : v1(v_) {}
    std::nullptr_t v2; __union8_31 (std::nullptr_t v_) : v2(v_) {}
} T;

class Test {
public:
    virtual void dummy() {};
    template <typename P0>
    Test(P0 t);
};

template <typename P0>
Test::Test(P0 t) {
}

#endif
