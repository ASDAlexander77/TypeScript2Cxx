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
    auto r = std::bit_and()(1,2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 