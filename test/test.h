#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;
class Test2;
extern Test* t;
extern std::function<void()> m1;
extern Test2* t2;
extern any m2;

class Test : public object {
public:
    js::number val = 10;

    virtual void testMethod();
};

class Test2 : public object {
public:
    js::number val = 20;
};

void fff(any m3);

#endif
