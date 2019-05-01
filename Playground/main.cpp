//#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

/*
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

struct CallPtrWrapper {
    void* _t;
    template < class T >
    CallPtrWrapper(const T& t) : _t((void*)&t) {
    }

    template < typename R, class ... Args >
    R call(Args... args) {
        auto fcall(*(std::function<R(Args...)>*)_t);
        return fcall(args...);
    }
};
*/

/*
struct or_t {
    template <typename T>
    constexpr bool operator()(const T &lhs, const T &rhs) const 
    {
        return lhs | rhs;
    }    
};
*/

int main(int argc, char** argv)
{
    /*
    auto m = [](int p1, const char* v) -> int 
    {
        return p1;
    };

    CallWrapper c(m);

    std::function<int(int, const char*)> f = m;
    std::function<int(int, const char*)> f2 = nullptr;

    std::cout << m(10, "Hello 1") << std::endl;
    std::cout << std::apply(m, std::make_tuple(20, "Hello 2")) << std::endl;
    std::cout << c.call(30, "Hello 3") << std::endl;

    // experiments
    CallPtrWrapper cp(f);

    auto v = cp.call<int>(10, "Test");
    */

    //auto res = or_t<int>(10, 20);
}
