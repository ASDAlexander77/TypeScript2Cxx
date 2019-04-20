#include "core.h"

using namespace js;

auto f(ReadOnlyArray<object> events)
{
    console.log(events[0]["name"]);
    if (events[1]) console.log("failed"_S);
};

