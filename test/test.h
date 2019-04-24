#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

void f(ReadOnlyArray<object> events)
{
    console.log(events[0]["name"]);
    if (events[1]) console.log("failed"_S);
};

#endif
