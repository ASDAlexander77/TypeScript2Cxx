#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename TC>
class Test;

template <typename TC>
class Test {
public:
    virtual void dummy() {};
    template <typename T>
    void Test1();
    void Test2();
    static void Test3();
};

template <typename TC>
template <typename T>
void Test<TC>::Test1()
{
    console.log("asd1"_S);
}

template <typename TC>
void Test<TC>::Test2()
{
    console.log("asd2"_S);
}

template <typename TC>
void Test<TC>::Test3()
{
    console.log("asd3"_S);
}

#endif
