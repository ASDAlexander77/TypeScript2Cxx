#include <iostream>
#include "core.h"

using namespace js;

void functionTest() {
    std::cout << "Hello" << std::endl;
}

int main(int argc, char** argv)
{
    any a = 1;
    any b = 2;
    any c = functionTest;

    std::cout << (int)a << " " << (int)b << std::endl;

    return 0;
}