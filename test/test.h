#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;
extern Test* t;
extern std::function<void()> m2;

class Test : public object {
public:
    js::number val = 10;

    virtual void testMethod();
};

#endif
