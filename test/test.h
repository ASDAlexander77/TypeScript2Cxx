#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
class InternalPromise;

template <typename T>
class InternalPromise : public object {
public:
    union __union85_118 {
        Nullable<InternalPromise<T >* >* v0; __union85_118(Nullable<InternalPromise<T >* >* v_) : v0(v_) {}
        T v1; __union85_118(T v_) : v1(v_) {}
    };
    std::function<__union85_118(Nullable<T >*)> _onFulfilled;
};

#endif
