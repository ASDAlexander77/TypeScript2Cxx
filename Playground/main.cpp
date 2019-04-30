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

template <typename T>
class property_t {
private:
    T _t;
public:
    property_t() {};
    property_t(T t_) : _t(t_) {};

    inline constexpr operator T() const {
        return _t;
    }

    inline constexpr T& operator=(T t_) {
        _t = t_;
        return _t;
    }
};

template <typename T, class C>
class property_getset {
public:
    typedef T (C::* get_method)();    
    typedef void (C::* set_method)(T t);    
private:
    C* _c;
    get_method _g;
    set_method _s;
    
public:
    property_getset(C* c_, get_method g_, set_method s_) : _c(c_), _g(g_), _s(s_) {};

    inline operator T() const {
        return ((*_c).*(_g))();
    }

    inline property_getset& operator=(T value) {
        ((*_c).*(_s))(value);
        return *this;
    }
};

template <typename T>
class property_getset2 {
public:
private:
    std::function<T(void)> _g;
    std::function<void(T)> _s;
    
public:
    property_getset2(std::function<T(void)> g_, std::function<void(T)> s_) : _g(g_), _s(s_) {};

    inline operator T() const {
        return _g();
    }

    inline property_getset2& operator=(T value) {
        _s(value);
        return *this;
    }
};


class Test {
private:
    int m;

public:    
    property_t<int> field;
    property_t<js::string> field2;

    Test() {}

    int get_M() {
        return m;
    }

    void set_M(int value) {
        m = value;
    }

    property_getset<int, Test> M = { this, &Test::get_M, &Test::set_M };
    property_getset2<int> M2 = { 
            [=]() -> auto  { return m; }, 
            [&](int value) { m = value; } 
        };
};

int main(int argc, char** argv)
{
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

    Test* t = new Test();
    t->field = 12;
    t->field2 = "Hello";
    std::cout << t->field << t->field2 << std::endl;

    t->M = 25;
    t->M2 = 30;

    std::cout << t->M << std::endl;
    std::cout << t->M2 << std::endl;
}
