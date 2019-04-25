#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
class Test;

template <typename T>
class Test {
public:
    virtual void dummy() {};
    void Test1();
    template <typename T2>
    void Test2();
    static void Test3();
};

template <typename T>
void Test<T>::Test1()
{
    console.log("asd1"_S);
}

template <typename T>
template <typename T2>
void Test<T>::Test2()
{
    console.log("asd2"_S);
}

template <typename T>
void Test<T>::Test3()
{
    console.log("asd3"_S);
}

#endif
