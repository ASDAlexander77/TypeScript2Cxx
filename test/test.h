#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;
extern Test* t;

class Test : public object {
public:
    std::function<void(any, any)> _pointerInput;

    virtual void runTest();
    virtual void add(std::function<void(any, any)> callback);
};

#endif
