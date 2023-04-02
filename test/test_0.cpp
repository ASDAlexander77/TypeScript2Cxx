#include "test_0.h"

using namespace js;

array<js::number> list = array<js::number>{ 1, 2, 3 };

void Main(void)
{
    console->log(const_(list)[0]);
    console->log(const_(list)[1]);
    console->log(const_(list)[2]);
    list[2] = 10;
    console->log(const_(list)[2]);
}

MAIN
