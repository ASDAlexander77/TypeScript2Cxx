#include "core.h"

using namespace js;

std::function<std::function<js::number()>()> f = [&]()
{
    js::number a = 10;
    return [&]()
    {
        return a;
    };
};

void Main(void)
{
    f()();
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
