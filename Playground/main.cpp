#include "core.h"
#include <iostream>

using namespace js;

any buildName(any firstName, any secondName = any()) {
    return firstName + secondName;
}

int main(int argc, char **argv)
{
    any outer = 12;
    std::function<any(const std::initializer_list<any> &)> main1 = [&] (const std::initializer_list<any> &params) ->any {
        auto iter = params.begin();
        auto end = params.end();
        any p0 = end != iter ? *iter++ : any();
        any p1 = end != iter ? *iter++ : any();

        std::cout << outer << std::endl;
        return p0 + p1;
    };

    any o1 = any(anyTypeId::object);
    o1["method"] = buildName;
    o1["method2"] = main1;

    any r = o1["method"](any("First"), any("Second"));

    std::cout << r << std::endl;

    any r2 = o1["method"](any("First"));

    std::cout << r2 << std::endl;    

    any r3 = o1["method2"](any("p1"), any("p2"));

    std::cout << r3 << std::endl;    

    return 0;
}