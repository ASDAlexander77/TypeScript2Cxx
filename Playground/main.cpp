//#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

auto func(int = 10) -> int;

const auto val1 = true;

auto val2 = func();

auto func(int param) -> int {
    return 1;
}

int main(int argc, char** argv)
{
}
