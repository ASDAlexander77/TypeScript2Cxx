//#define EXTRA_DEBUG
#include "core.h"
#include <iostream>

using namespace js;

template <typename T>
constexpr bool logical_or_t(const T& lhs, const T& rhs) 
{
    return lhs || rhs;
}

int func1() {
    std::cout << "value 1" << std::endl;
    return 10;
}

int func2() {
    std::cout << "value 2" << std::endl;
    return 20;
}

int main(int argc, char** argv)
{
    auto res = logical_or_t(func1(), func2());
}
