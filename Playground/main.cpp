#include "core.h"
#include <iostream>

using namespace js;

any buildName(any firstName, any secondName = any()) {
    return firstName + secondName;
}

int main(int argc, char **argv)
{
    std::function<any(any, const std::initializer_list<any> &)> main1 = [&] (any _this, const std::initializer_list<any> &params) ->any {
        return any();
    };

    any o1 = any(anyTypeId::object);
    o1["method"] = buildName;

    any r = o1["method"](any("First"), any("Second"));

    std::cout << r << std::endl;

    any r2 = o1["method"](any("First"));

    std::cout << r2 << std::endl;    

    return 0;
}