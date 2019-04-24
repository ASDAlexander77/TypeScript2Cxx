#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
using Nullable = T;
typedef union __union55_100 {
    undefined_t v0; __union55_100 (undefined_t v_) : v0(v_) {}
    std::nullptr_t v1; __union55_100 (std::nullptr_t v_) : v1(v_) {}
    boolean v2; __union55_100 (boolean v_) : v2(v_) {}
    string v3; __union55_100 (string v_) : v3(v_) {}
    js::number v4; __union55_100 (js::number v_) : v4(v_) {}
} Primitive;
#endif
