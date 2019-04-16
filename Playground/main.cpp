//#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>
#include <tuple>

using namespace js;

template < class T >
struct CallWrapper {
    T _t;
    CallWrapper(T t) : _t(t) {
    }

    template < typename ... Args > 
    decltype(auto) call(Args ... args)
    {
        auto tpl = std::make_tuple(args...);
        return std::apply(_t, tpl);
    }
};

int main(int argc, char** argv)
{
    auto m = [](int p1, const char* v) -> int 
    {
        return p1;
    };

    CallWrapper c(m);

    std::cout << m(10, "Hello 1") << std::endl;
    std::cout << std::apply(m, std::make_tuple(20, "Hello 2")) << std::endl;
    std::cout << c.call(30, "Hello 3") << std::endl;
}
