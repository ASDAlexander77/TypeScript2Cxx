#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test {
public:
    virtual void dummy() {};
    Array<js::number>* test();
};

Array<js::number>* Test::test()
{
    return cast<Array<js::number>*>(new Array<any>());
}

#endif
