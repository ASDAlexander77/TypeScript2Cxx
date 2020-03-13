#include "test.h"

using namespace js;

any f = js::function_t([&]()
{
    return 10;
});


template <typename... Types, typename... Args, class = std::enable_if<sizeof...(Types) == sizeof...(Args)>>
auto conditional_invoke(Args... args)
{
    return sizeof...(args);
}

template <class _Ret, class... _Types>            
struct _Get_function_args_count {
    using count = sizeof...(_Types);
};

template <class F>
struct _function_t
{
    F _f;
    constexpr static size_t _count = _Get_function_args_count<F>::count;

    _function_t(const F &f) : _f(f)
    {
    }

/*
    template <typename... Args>
    auto operator()(Args... args) -> decltype(_f(args...)) {
        return _f(args...);
    }
*/    

    template <typename... Args>
    auto operator()(Args... args) -> int {
        return sizeof...(args);
    }
    
    auto invoke() -> void {

    }
};

void Main(void)
{
    _function_t f([&]()
    {
        return 10;
    });

    f();

    std::function<void()> ff;
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
