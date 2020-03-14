#include "core.h"
#include <any>

using namespace js;


void Main(void)
{
    std::any s = std::function([] (int x, int y) {

    });

    std::invoke(std::any_cast<std::function<void(int, int)>>(s), 1, 2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 