#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

typedef union __union16_72 {
    undefined_t v0; __union16_72 (undefined_t v_) : v0(v_) {}
    std::nullptr_t v1; __union16_72 (std::nullptr_t v_) : v1(v_) {}
    boolean v2; __union16_72 (boolean v_) : v2(v_) {}
    string v3; __union16_72 (string v_) : v3(v_) {}
    js::number v4; __union16_72 (js::number v_) : v4(v_) {}
    Function* v5; __union16_72 (Function* v_) : v5(v_) {}
} Primitive;

template <typename T>
using Immutable = T;

template <typename T>
using DeepImmutable = T;

template <typename T>
class DeepImmutableArray : public ReadonlyArray {
public:
};

template <typename T>
using DeepImmutableObject = any;

#endif
