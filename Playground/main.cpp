#include "core.h"

using namespace js;

std::function<any(any)> f = [&](any f1)
{
    js::number a = 10;
    return cast<any>(f1(a));
};

void Main(void)
{
    f(js::function_t([&](any b)
    {
        return cast<any>(b);
    }
    ))();
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
