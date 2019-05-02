#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
class InternalPromise;

enum PromiseStates {
    Pending, Fulfilled, Rejected
};
template <typename T>
class InternalPromise : public object {
public:
    PromiseStates* _state = PromiseStates::Pending;
};

#endif
