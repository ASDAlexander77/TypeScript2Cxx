#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

int main(int argc, char **argv)
{
    std::cout << "size of any: " << sizeof(any) << std::endl;

    static std::unordered_map<any, int> u = {
        {any("RED"), 1},
        {any("GREEN"), 2},
        {any("BLUE"), 3}
    };

    auto case1 = u[any("NONE")];
    auto case2 = u[any("GREEN")];
    
    return 0;
}