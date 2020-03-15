#include "core.h"
#include <any>

using namespace js;


void Main(void)
{
    std::any s = std::function([] (int x, int y) {

    });

    std::invoke(std::any_cast<std::function<void(int, int)>>(s), 1, 2);


    auto fff = function_t([] (int x, int y) {
        std::cout << "Hello" << std::endl;
    });

    fff(1, 2);

    auto fff2 = js::function_t([] (int x, int y) -> auto {
        std::cout << "Hello 2" << std::endl;
        return x + y;
    });

    auto fr = fff2(1, 2);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 