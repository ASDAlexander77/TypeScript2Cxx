#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test {
public:
    virtual void dummy() {};
    string test();
};

string Test::test()
{
    return ""_S;
}

#endif
