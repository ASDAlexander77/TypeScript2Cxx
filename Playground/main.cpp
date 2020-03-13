#include "core.h"

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
inline constexpr auto _Get_function_args_count = sizeof...(_Types);

template <class F>
struct _function_t
{
    F _f;
    constexpr static size_t _count = _Get_function_args_count<F>;

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

        std::cout << "Hello: " << _count << std::endl;

        return sizeof...(args);
    }    
};

void Main(void)
{
    _function_t f([&](int a, int b)
    {
        return a + b;
    });

    auto a = std::function_t<void()>();

    f(1, 2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
