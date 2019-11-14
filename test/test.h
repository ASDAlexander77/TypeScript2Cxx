#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename ...Args>
void push(Args... objs);

template <typename ...Args>
void push(Args... objs)
{
    for (auto& obj : {objs...})
    {
        console->log(obj);
    }
};


#endif
