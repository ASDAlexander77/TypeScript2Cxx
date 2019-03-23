#include <iostream>
#include "core.h"

using namespace js;

int main(int argc, char** argv)
{
    any a = 1;
    any b = 2;

    std::cout << (int)a << " " << (int)b << std::endl;

    return 0;
}