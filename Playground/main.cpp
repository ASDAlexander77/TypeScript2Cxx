#include "core.h"
#include <any>

using namespace js;

template <typename Rx, typename _Cls, typename _Method, typename... Args>
struct _Deduction_MethodPtr;

template <typename Rx, typename _Cls, typename _Method, typename... Args>
struct _Deduction_MethodPtr<Rx(*)(Args...)>
{
    using _ReturnType = typename Rx;
};


template <typename F, typename _type = decltype(&F::operator())>
struct _Deduction 
{
    using type = typename _type;
};

template <typename F>
struct func
{
    using _MethodType = typename _Deduction<F>::type;
    using _ReturnType = typename _Deduction_MethodPtr<_MethodType>::_ReturnType;

    _MethodType m;
    _ReturnType r;

    func(const F& f)
    {
    }
};        

void Main(void)
{
    std::any s = std::function([] (int x, int y) {

    });

    std::invoke(std::any_cast<std::function<void(int, int)>>(s), 1, 2);

    auto f = func([] (int x, int y) {
        std::cout << "Hello" << std::endl;
    });
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 