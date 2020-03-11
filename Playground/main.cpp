#include "core.h"

using namespace js;

std::function<std::function<js::number()>()> f = [&]()
{
    auto i = 10;
    return [&]()
    {
        return i;
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
