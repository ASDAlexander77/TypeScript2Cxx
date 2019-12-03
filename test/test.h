#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename ...Args>
void push(Args... objs_);

template <typename ...Args>
void push(Args... objs_)
{
    array objs = {objs_...};
    for (auto& obj : objs)
    {
        console->log(obj);
    }
};


#endif
