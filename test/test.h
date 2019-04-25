#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test {
public:
    virtual void dummy() {};
    template <typename T>
    void Test1();
    virtual void Test2();
    static void Test3();
};

template <typename T>
void Test::Test1()
{
    console.log("asd1"_S);
}

#endif
