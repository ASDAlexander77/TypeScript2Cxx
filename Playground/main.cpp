#include "core.h"

using namespace js;

void Main(void)
{
    auto i = any(1);

/*
    auto f = any([] (int x, int y) -> int {
        std::cout << "Hello" << std::endl;
        return x + y;
    });

    auto r = f(1, 2);
*/    
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 