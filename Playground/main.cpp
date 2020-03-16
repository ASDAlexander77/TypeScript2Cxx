#include "core.h"
#include <any>

using namespace js;

template <typename T>
struct _Deduction_MethodPtr;

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx(__thiscall _Cls::*)(Args...) const>
{
    using _ReturnType = typename Rx;
    const static size_t _CountArgs = sizeof...(Args);
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
    using _MethodPtr = _Deduction_MethodPtr<_MethodType>;
    using _ReturnType = typename _MethodPtr::_ReturnType;
    size_t _count;

    _MethodType m;
    _ReturnType r;

    func(const F& f)
    {
        _count = _Deduction_MethodPtr<_MethodType>::_CountArgs;
        std::cout << "Args" << _count << std::endl;
    }
};        

void Main(void)
{
    auto f = func([] (int x, int y) {
        std::cout << "Hello" << std::endl;
        return x + y;
    });

    std::any s = std::function([] (int x, int y) {

    });

    std::invoke(std::any_cast<std::function<void(int, int)>>(s), 1, 2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 