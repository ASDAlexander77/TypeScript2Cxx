#include "core.h"
#include <any>
#include <utility>

using namespace js;

template <typename T>
struct _Deduction_MethodPtr;

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx(__thiscall _Cls::*)(Args...) const>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename F, typename _type = decltype(&F::operator())>
struct _Deduction 
{
    using type = _type;
};

template<typename F, typename Array, std::size_t... I>
auto invoke_seq_impl(const F& f, const Array& a, std::index_sequence<I...>)
{
    return std::invoke(f, a[I]...);
}

template<std::size_t N, typename F, typename Array, typename Indices = std::make_index_sequence<N>>
auto invoke_seq(const F& f, const Array& a)
{
    return invoke_seq_impl(f, a, Indices{});
}

struct func
{
    virtual any invoke(std::initializer_list<any> args_) = 0;

    template <typename... Args>
    auto operator()(Args... args)
    {
        return invoke({args...});
    }
};

template <typename F>
struct func_t : func
{
    using _MethodType = typename _Deduction<F>::type;
    using _MethodPtr = _Deduction_MethodPtr<_MethodType>;
    using _ReturnType = typename _MethodPtr::_ReturnType;
    
    F _f;
    size_t _count;

    _MethodType m;
    _ReturnType r;

    func_t(const F& f) : _f{f}, _count{_Deduction_MethodPtr<_MethodType>::_CountArgs}
    {
        std::cout << "Args " << _count << std::endl;
    }

    virtual any invoke(std::initializer_list<any> args_) override
    {
        return invoke_seq<_Deduction_MethodPtr<_MethodType>::_CountArgs>(_f, std::vector<any>(args_));
    }
};        

void Main(void)
{
    func& f = func_t([] (int x, int y) {
        std::cout << "Hello" << std::endl;
        return x + y;
    });

    auto r = f(1, 2);

    std::any s = std::function([] (int x, int y) {

    });

    std::invoke(std::any_cast<std::function<void(int, int)>>(s), 1, 2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 