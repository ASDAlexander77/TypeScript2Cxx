#include "test_0.h"

using namespace js;

array<js::number> a = array<js::number>{ 10, 20, 30, 40 };
js::number count = 0;

void Main(void)
{
    for (auto& i : keys_(a))
    {
        count++;
        console->log(count);
        if (equals(count, 1)) continue;
        break;
    }
}

MAIN
