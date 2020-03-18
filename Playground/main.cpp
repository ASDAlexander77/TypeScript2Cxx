#include "core.h"
#include <any>
#include <utility>

using namespace js;

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
    func& f = func_t([] (int x, int y) -> int {
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
 