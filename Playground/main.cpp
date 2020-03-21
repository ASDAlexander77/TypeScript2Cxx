#include "core.h"

using namespace js;

struct Arr
{
    int v;

    int operator [](int i) const
    {
        std::cout << "Read only" << std::endl;
        return 1;
    }

    int& operator [](int i)
    {
        std::cout << "Write" << std::endl;
        return v;
    }
};

void Main(void)
{
    /*
    auto f = any([] (int x, int y) -> int {
        std::cout << "Hello" << std::endl;
        return x + y;
    });

    auto r = f(1, 2);

    std::function<int(int, int)> f2 = f;
    auto r2 = f2(1, 2);
    */
   Arr a;
   auto r = static_cast<const Arr&>(a)[1];
   a[1] = 10;
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 