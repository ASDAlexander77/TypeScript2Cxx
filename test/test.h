#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class T;

class T : public object {
public:
    void test(float a);
};

void T::test(float a)
{
}

#endif
