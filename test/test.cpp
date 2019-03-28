#include "core.h"

using namespace js;

auto f(any events)
{
    console.log(events[0]["name"]);
    if (events[1])
    {
        console.log("failed");
    }
}

int main(int argc, char **argv)
{
    f({{std::make_tuple("name", "blur"),
        std::make_tuple("handler", 1)}});

    return 0;
}
