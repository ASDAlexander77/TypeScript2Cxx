#include "core.h"

using namespace js;

std::function<std::function<js::number()>()> f = [&]()
{
    js::number a = 10;
    return js::function_t([&]()
    {
        return cast<any>(a);
    }
    );
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
